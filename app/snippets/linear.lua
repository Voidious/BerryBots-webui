------------------------------------------------------------------------------
-- Linear targeting. Fires lasers and torpedos at future enemy position based
-- on a simple linear projection.
------------------------------------------------------------------------------

function fireLinearGuns(enemyShips)
  if (# enemyShips > 0) then
    local targetShip = enemyShips[1]
    if (targetShip ~= nil) then
      if (ship:laserGunHeat() == 0) then
        fireLaserGun(targetShip)
      end
      if (ship:torpedoGunHeat() == 0) then
        fireTorpedoGun(targetShip)
      end
    end
  end
end

function fireLaserGun(targetShip)
  local constants = world:constants()
  local distance = math.sqrt(
      distSq(ship:x(), ship:y(), targetShip.x, targetShip.y))
  local laserFlightTime =
      math.ceil((distance - constants.LASER_SPEED) / constants.LASER_SPEED)
  local shipRadius = constants.SHIP_RADIUS
  local targetx = math.max(shipRadius, math.min(world:width() - shipRadius,
      targetShip.x + (math.cos(targetShip.heading) * targetShip.speed
          * laserFlightTime)))
  local targety = math.max(shipRadius, math.min(world:height() - shipRadius,
      targetShip.y + (math.sin(targetShip.heading) * targetShip.speed
          * laserFlightTime)))
  local laserAngle = math.atan2(targety - ship:y(), targetx - ship:x())
  ship:fireLaser(laserAngle)
end

function fireTorpedoGun(targetShip)
  local constants = world:constants()
  local distance = math.sqrt(
      distSq(ship:x(), ship:y(), targetShip.x, targetShip.y))
  local torpedoFlightTime =
      math.ceil((distance - constants.TORPEDO_SPEED) / constants.TORPEDO_SPEED)
  local shipRadius = constants.SHIP_RADIUS
  local targetx = math.max(shipRadius, math.min(world:width() - shipRadius,
      targetShip.x + (math.cos(targetShip.heading) * targetShip.speed
          * torpedoFlightTime)))
  local targety = math.max(shipRadius, math.min(world:height() - shipRadius,
      targetShip.y + (math.sin(targetShip.heading) * targetShip.speed
          * torpedoFlightTime)))
  local torpedoAngle = math.atan2(targety - ship:y(), targetx - ship:x())
  local finalDistance = math.sqrt(
      distSq(ship:x(), ship:y(), targetx, targety))
  ship:fireTorpedo(torpedoAngle, (distance + finalDistance) / 2)
end

function distSq(x1, y1, x2, y2)
  return square(x1 - x2) + square(y1 - y2)
end

function square(x)
  return x * x
end

------------------------------------------------------------------------------
-- /Linear targeting
------------------------------------------------------------------------------
