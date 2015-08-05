------------------------------------------------------------------------------
-- A learning gun.
--
-- Records enemy movements as displacement vectors and matches similar states
-- via k-nearest neighbors search (KNN).
--
-- This code is much more sophisticated than the other starter guns, but the
-- algorithm is straightforward.
------------------------------------------------------------------------------

-- Number of firing angles to consider, evenly spaced from 0 to 2pi.
FIRING_ANGLES = 32

-- Number of neighbors to use in k-nearest neighbors search.
MAX_K = 10

-- Maximum number of data points to search through.
MAX_SCANS = 2000

-- Weights when determining distance in k-dimensional space. Attributes:
--    speed, distance, acceleration
-- See: newDataPoint(wave)
WEIGHTS = {1, 1, 1}

maxDistance = 1200
enemyData = { laserPoints = { },
              laserWaves = { },
              torpedoPoints = { },
              torpedoWaves = { },
              vectorMap = { },
              speed = 0 }
laserEnabled = true
torpedoEnabled = true

function fireLearningGuns(enemyShips, sensors)
  see(enemyShips)
  collectWaves()
  fireWaves(enemyShips)
  aimFireLaser()
  aimFireTorpedo()
end

-- Updates data model about the enemy ship each tick.
function see(enemyShips)
  enemyData.speed = 0
  enemyData.visible = false

  if (# enemyShips > 0) then
    local enemyShip = enemyShips[1]
    enemyData.x = enemyShip.x
    enemyData.y = enemyShip.y
    enemyData.heading = enemyShip.heading
    enemyData.visible = true

    enemyData.prevSpeed = enemyData.speed
    enemyData.speed = enemyShip.speed
    enemyData.distance = math.sqrt(square(ship:x() - enemyData.x)
                                   + square(ship:y() - enemyData.y))
  end
end

-- Fires waves based on current state of the enemy ship.
--
-- A wave is a mechanic for collecting data about ship movement. We fire one
-- and attach the enemy ship's current state. The wave expands outward from our
-- ship at the same speed as a laser or torpedo. It "breaks" when it passes the
-- enemy ship. At this point, our projectile "would have" hit the enemy ship.
-- We can compare the enemy's current location to its location at fire time to
-- get a net displacement.
--
-- The net displacement, in whatever form we record it, tells us how we
-- "should have" fired to hit the enemy ship. We can use this to train a
-- classification algorithm which learns the enemy's movement style.
function fireWaves(enemyShips)
  if (# enemyShips > 0) then
    local time = world:time()
    local enemyShip = enemyShips[1]

    local laserWave = newWaveEntry(enemyShip, time)
    table.insert(enemyData.laserWaves, laserWave)
    enemyData.lastLaserWave = laserWave

    local torpedoWave = newWaveEntry(enemyShip, time)
    table.insert(enemyData.torpedoWaves, torpedoWave)
    enemyData.lastTorpedoWave = torpedoWave
  end
end

function newWaveEntry(enemyShip, time)
  local sourceLocation = { x = ship:x(), y = ship:y() }
  return { source = sourceLocation,
           target = { x = enemyShip.x,
                      y = enemyShip.y,
                      heading = enemyShip.heading,
                      speed = enemyShip.speed,
                      prevSpeed = enemyData.prevSpeed,
                      distance = enemyData.distance },
           fireTime = time }
end

function collectWaves()
  collectWavesFor(enemyData.laserPoints, enemyData.laserWaves,
                  world:constants().LASER_SPEED)
  collectWavesFor(enemyData.torpedoPoints, enemyData.torpedoWaves,
                  world:constants().TORPEDO_SPEED)
end

function collectWavesFor(points, waves, projectileSpeed)
  local time = world:time()
  local deadWaves = { }
  for j, wave in ipairs(waves) do
    local enemyDistanceSq = square(enemyData.x - wave.source.x)
                            + square(enemyData.y - wave.source.y)
    local waveDistanceSq =
        square(projectileSpeed * (time - wave.fireTime + 1))
    if (waveDistanceSq > enemyDistanceSq) then
      local p = newDataPoint(wave)
      table.insert(points, p)
      enemyData.vectorMap[p] = newVector(wave, enemyData, time)
      table.insert(deadWaves, wave)
    end
  end
  local numWaves = (# waves)
  for j, deadWave in ipairs(deadWaves) do
    for k, wave in ipairs(waves) do
      if (wave == deadWave) then
        waves[k] = nil
        break
      end
    end
  end
  compactTable(waves, numWaves)
end

function newDataPoint(wave)
  local target = wave.target
  local laserSpeed = world:constants().LASER_SPEED
  return { math.min(target.speed, 50) / 50,
           math.min(target.distance, maxDistance) / maxDistance,
           (math.max(-1, math.min(target.speed - target.prevSpeed, 1)) + 1) / 2 }
end

function newVector(wave, enemyData, time)
  local dx = enemyData.x - wave.target.x
  local dy = enemyData.y - wave.target.y
  local theta = math.atan2(dy, dx) - wave.target.heading
  local dTime = time - wave.fireTime
  local distance = math.sqrt(square(dx) + square(dy)) / dTime
  return { angle = normalAbsoluteAngle(theta), distance = distance }
end

function getBestFiringAngle(wave, dataPoints, projectileSpeed)
  local xShip = ship:x()
  local yShip = ship:y()
  local nowPoint = newDataPoint(wave)

  local k = math.max(1, math.min(math.ceil(# dataPoints), MAX_K))
  local neighbors =
      nearestNeighbors(dataPoints, nowPoint, WEIGHTS, k)

  local neighborDistances = { }
  for i, dataPoint in ipairs(neighbors) do
    neighborDistances[dataPoint] = math.max(0.0000001,
        math.sqrt(distanceSq(nowPoint, dataPoint, WEIGHTS)))
  end

  local firingAngles = { }
  local neighborAngles = { }

  for i, dataPoint in ipairs(neighbors) do
    local v = enemyData.vectorMap[dataPoint]
    local neighborAngle = projectFiringAngle({ x = xShip, y = yShip },
        { x = enemyData.x, y = enemyData.y }, enemyData.heading, v,
        projectileSpeed)
    neighborAngles[dataPoint] = neighborAngle
    table.insert(firingAngles, neighborAngle)
  end

  for i = 1, FIRING_ANGLES do
    local firingAngle = math.pi * 2 * (i - 1) / FIRING_ANGLES
    table.insert(firingAngles, firingAngle)
  end

  local bestFiringAngle = math.atan2(enemyData.y - yShip, enemyData.x - xShip)
  local bestDensity = -math.huge
  local targetDistance =
      math.sqrt(square(enemyData.x - xShip) + square(enemyData.y - yShip))
  local bandwidth = math.abs(world:constants().SHIP_RADIUS / targetDistance)
  for i, firingAngle in ipairs(firingAngles) do
    local density = 0
    for j, dataPoint in ipairs(neighbors) do
      local neighborAngle = neighborAngles[dataPoint]
      if (neighborAngle ~= nil) then
        local ux =
            (firingAngle - normalAbsoluteAngle(neighborAngle)) / bandwidth
        if (math.abs(ux) < 1) then
          density = density
              + ((1 - cube(math.abs(ux))) / neighborDistances[dataPoint])
        end
      end
    end

    if (density > bestDensity) then
      bestFiringAngle = firingAngle
      bestDensity = density
    end
  end

  return bestFiringAngle
end

function aimFireLaser()
  if (not laserEnabled or ship:laserGunHeat() > 0) then
    return
  end

  if (enemyData ~= nil and (# enemyData.laserPoints > 0)) then
    local bestFiringAngle = getBestFiringAngle(enemyData.lastLaserWave,
        enemyData.laserPoints, world:constants().LASER_SPEED)
    local success = ship:fireLaser(bestFiringAngle)

    -- Learn if the laser gun is disabled by the stage, to save CPU time.
    if (not success) then
      laserEnabled = false
    end
  end
end

function aimFireTorpedo()
  if (not torpedoEnabled or ship:torpedoGunHeat() > 0) then
    return
  end

  if (enemyData ~= nil and (# enemyData.torpedoPoints > 0)) then
    local bestFiringAngle = getBestFiringAngle(enemyData.lastTorpedoWave,
        enemyData.torpedoPoints, world:constants().TORPEDO_SPEED)
    local success = ship:fireTorpedo(bestFiringAngle, enemyData.distance)

    -- Learn if the torpedo gun is disabled by the stage, to save CPU time.
    if (not success) then
      torpedoEnabled = false
    end
  end
end

-- Projects movement of enemy along a displacement vector to figure out what
-- firing angle we should use. E.g., if enemy is at distance=125, a naive
-- calcaulation says that a laser will take 4 ticks to get there, but it may
-- take 3 or 6 or 50, depending on how the enemy moves.
function projectFiringAngle(sourceLocation, targetLocation, targetHeading,
                            vector, projectileSpeed)
  local heading = vector.angle + targetHeading
  local distance = vector.distance
  local dx = math.cos(heading) * distance
  local dy = math.sin(heading) * distance

  local newLocation = nil
  local enemyDistanceSq = math.huge
  local projectileTime = 0
  local projectileDistanceSq = -math.huge

  while (projectileDistanceSq < enemyDistanceSq) do
    projectileTime = projectileTime + 1
    newLocation = { x = targetLocation.x + (projectileTime * dx),
                    y = targetLocation.y + (projectileTime * dy) }

    if (isOutOfBounds(newLocation)) then
      return nil
    end

    enemyDistanceSq = xyDistanceSq(sourceLocation, newLocation)
    projectileDistanceSq = square((projectileTime + 1) * projectileSpeed)
  end

  return math.atan2(newLocation.y - sourceLocation.y,
                    newLocation.x - sourceLocation.x)
end

function xyDistanceSq(sourceLocation, targetLocation)
  return square(targetLocation.x - sourceLocation.x)
         + square(targetLocation.y - sourceLocation.y)
end


function getLast(t, len)
  local last = len
  while (last >= 0 and t[last] == nil) do
    last = last - 1
  end
  return last
end

function compactTable(t, len)
  local last = getLast(t, len)

  -- Everything's nil.
  if (last < 0) then
    return t
  end

  for i = 1, len do
    local j = t[i]
    if (j == nil) then
      if (i < last) then
        t[i] = t[last]
        t[last] = nil
        last = getLast(t, len)
      end
    end
  end
end

function square(x)
  return x * x
end

function cube(x)
  return x * x * x
end

function roundOver()
  enemyData.laserWaves = { }
  enemyData.torpedoWaves = { }
  enemyData.speed = 0
end

--- Returns the nearest neighbors of a point in a data set via linear search.
-- @param dataPoints The data set containing points to search through. This is a
--     nested table (2-dimensional array), since each point is itself a table.
-- @param testPoint The reference point for the nearest neighbor search.
-- @param weights A table of weights to apply to each dimension when calculating
--     distances between data points.
-- @param count The number of neighbors to return.
-- @return The set of nearest neighbor points. This is a nested table
--     (2-dimensional array), since each point is a table itself.
function nearestNeighbors(dataPoints, testPoint, weights, count)
  local numPoints = (# dataPoints)

  if (numPoints <= count) then return dataPoints end

  local skip = math.max(0, numPoints - MAX_SCANS)
  local closestPoints = { }
  local nearestDistances = { }
  for i = 1, count do
    local p = dataPoints[i + skip]
    table.insert(closestPoints, p)
    table.insert(nearestDistances, distanceSq(p, testPoint, weights))
  end

  local closestThreshold =
      findLongestDistance(closestPoints, testPoint, weights)
  for i = count + 1 + skip, numPoints do
    local p = dataPoints[i]
    local thisDistance = distanceSq(p, testPoint, weights)
    if (thisDistance < closestThreshold) then
      closestThreshold = findAndReplaceLongestDistance(
          closestPoints, count, nearestDistances, p, thisDistance)
    end
  end

  return closestPoints
end

function distanceSq(p, q, weights)
  local len = (# weights)
  local totalSq = 0
  for i = 1, len do
    local diff = (p[i] - q[i]) * weights[i]
    totalSq = totalSq + (diff * diff)
  end
  return totalSq
end

function findLongestDistance(dataPoints, testPoint, weights)
  local longestDistance = 0
  for i, p in ipairs(dataPoints) do
    longestDistance =
        math.max(longestDistance, distanceSq(dataPoints[i], testPoint, weights))
  end
  return longestDistance
end

function findAndReplaceLongestDistance(
    dataPoints, numPoints, distances, newPoint, newDistance)
  local longest = 0
  local nextLongest = 0
  local longestIndex = 1
  for i = 1, numPoints do
    local distance = distances[i]
    if (distance > longest) then
      nextLongest = longest
      longest = distance
      longestIndex = i
    elseif (distance > nextLongest) then
      nextLongest = distance
    end
  end

  dataPoints[longestIndex] = newPoint
  distances[longestIndex] = newDistance

  return math.max(nextLongest, newDistance)
end

function normalAbsoluteAngle(x)
  while (x >= 2 * math.pi) do
    x = x - (2 * math.pi)
  end
  while (x < 0) do
    x = x + (2 * math.pi)
  end
  return x
end

function isOutOfBounds(p)
  local shipRadius = world:constants().SHIP_RADIUS
  return (p.x < shipRadius or p.x > world:width() - shipRadius
      or p.y < shipRadius or p.y > world:height() - shipRadius)
end

------------------------------------------------------------------------------
-- /Learning gun
------------------------------------------------------------------------------
