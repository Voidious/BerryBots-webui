------------------------------------------------------------------------------
-- Direct targeting. Fires directly at the enemy's current location.
------------------------------------------------------------------------------

function fireDirectGuns(enemyShips)
  if (# enemyShips > 0) then
    local targetShip = enemyShips[1]
    if (targetShip ~= nil) then
      local directAngle =
          math.atan2(targetShip.y - ship:y(), targetShip.x - ship:x())
      if (ship:laserGunHeat() == 0) then
        ship:fireLaser(directAngle)
      end
      if (ship:torpedoGunHeat() == 0) then
        local distance = math.sqrt(
            distSq(ship:x(), ship:y(), targetShip.x, targetShip.y))
        ship:fireTorpedo(directAngle, distance)
      end
    end
  end
end

function distSq(x1, y1, x2, y2)
  return square(x1 - x2) + square(y1 - y2)
end

function square(x)
  return x * x
end

------------------------------------------------------------------------------
-- /Direct targeting
------------------------------------------------------------------------------
