------------------------------------------------------------------------------
-- Chase ship movement.
------------------------------------------------------------------------------

local moveAngle = math.random() * 2 * math.pi

function moveChase(enemyShips)
  local time = world:time()
  if (# enemyShips == 0) then
    if (time % 12 == 0) then
      moveAngle = (moveAngle + math.pi) % (2 * math.pi)
    end
    if (time % 12 < 6 and ship:speed() > 0) then
      ship:fireThruster(ship:heading() + math.pi, ship:speed())
    else
      ship:fireThruster(moveAngle, 1)
    end
  else
    local enemyShip = enemyShips[1]
    shipGoto(enemyShip.x, enemyShip.y)
  end
end

function shipGoto(x, y)
  moveAngle = math.atan2(y - ship:y(), x - ship:x())
  ship:fireThruster(moveAngle, 1)
end

function square(x)
  return x * x
end

function distance(x1, y1, x2, y2)
  return math.sqrt(square(x1 - x2) + square(y1 - y2))
end

------------------------------------------------------------------------------
-- /Chase moves
------------------------------------------------------------------------------
