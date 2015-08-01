------------------------------------------------------------------------------
-- Bouncy ship movement.
------------------------------------------------------------------------------

MIN_SPEED = 2
MAX_SPEED = 15
PIVOT_CHANCE = 0.03

stopping = false
starting = true

-- If you already have roundOver(), copy this code into it and remove this.
function roundOver()
  stopping = false
  starting = true
end

function moveBouncy()
  if (ship:hitWall() or ship:hitShip()) then
    starting = true
    stopping = false
  end

  if (not starting and math.random() < PIVOT_CHANCE) then
    stopping = true
  end

  if (stopping) then
    if (ship:speed() > MIN_SPEED + 0.01) then
      ship:fireThruster(ship:heading() + math.pi, ship:speed() - MIN_SPEED)
    else
      stopping = false
      starting = true
    end
  end

  if (starting) then
    local heading = ship:heading()
    if (ship:speed() <= MIN_SPEED + 0.01) then
      heading = math.random() * 2 * math.pi
    end

    if (ship:speed() < MAX_SPEED - 0.01) then
      ship:fireThruster(heading, MAX_SPEED - ship:speed())
    else
      starting = false
    end
  end
end

------------------------------------------------------------------------------
-- /Bouncy moves
------------------------------------------------------------------------------
