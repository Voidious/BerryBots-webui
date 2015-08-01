-- A ship control program.
-- http://berrybots.com/apidoc/modules/ShipControl.html

ship = nil
world = nil

-- Initializes the ship control program. Runs once at the start of the match.
-- @param shipArg Your ship.
-- @param worldArg The game world.
function init(shipArg, worldArg)
  ship = shipArg
  world = worldArg

  ship:setName("Player")
  ship:setShipColor(255, 133, 177)
  ship:setLaserColor(255, 255, 255)
  ship:setThrusterColor(255, 133, 177)
end

-- Runs your code each tick, passing any information available to your ship
-- via line-of-sight.
-- @param enemyShips Enemy ships that you can see. Each entry has:
--     x, y, speed, heading, energy, name. E.g., enemyShips[1].speed.
-- @param sensors Events that were visible to your ship last tick.
--     E.g., sensors:shipFiredLaserEvents()
function run(enemyShips, sensors)
  move(enemyShips, sensors)
  fire(enemyShips, sensors)
end

------------------------------------------------------------------------------
-- Player's default behavior isn't very special. It heads east and fires in
-- random directions.
------------------------------------------------------------------------------

function move(enemyShips, sensors)
  ship:fireThruster(0, 1.0)
end

function fire(enemyShips, sensors)
  fireRandom(enemyShips)
end

function fireRandom(enemyShips)
  if (ship:laserGunHeat() == 0) then
    ship:fireLaser(math.random() * 2 * math.pi)
  end
  if (ship:torpedoGunHeat() == 0) then
    ship:fireTorpedo(math.random() * 2 * math.pi, math.random() * 500)
  end
end

------------------------------------------------------------------------------
-- /Player
------------------------------------------------------------------------------
