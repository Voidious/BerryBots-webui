------------------------------------------------------------------------------
-- Swirly ship movement.
------------------------------------------------------------------------------

MAX_SPEED = 12

orientation = 1

function moveSwirly()
  if (ship:hitWall() and math.random() < 0.5) then
    orientation = orientation * -1
  end
  if (ship:speed() < 0.0001) then
    ship:fireThruster(math.random() * 2 * math.pi, 1)
  elseif (ship:speed() < MAX_SPEED - 0.5) then
    ship:fireThruster(ship:heading(), MAX_SPEED - ship:speed())
  else
    ship:fireThruster(ship:heading() + (math.pi * orientation * .5), 1)
  end
end

------------------------------------------------------------------------------
-- /Swirly moves
------------------------------------------------------------------------------
