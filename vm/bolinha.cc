' bolinha
gameMode

' inicializacoes
x = 320
y = 240
r = 20
vx = 10
vy = 10

' loop principal
do
   cls

   if x-r <= 0 then vx = abs(vx)
   if x+r >= screenWidth() then vx = -abs(vx)
   if y-r < 0 then vy = abs(vy)
   if y+r >= screenHeight() then vy = -abs(vy)

   x += vx
   y += vy

   textout 10, 10, 24, "Ball Movement"
   circlefill x, y, r

   flip
loop
