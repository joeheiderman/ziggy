// tests go here; this will not be compiled when this package is used as a library
input.onButtonPressed(Button.A, function () {
    basic.showNumber(finch.getBattery())
})
finch.startFinch()
basic.forever(function () {
    if (finch.getLight(RLDir.Right) < 10) {
        finch.setBeak(0, 100, 100)
        finch.setMove(MoveDir.Forward, 100, 10)
        finch.setTail(
            TailPort.All,
            0,
            100,
            0
        )
    } else {
        finch.setBeak(100, 0, 0)
        finch.setMove(MoveDir.Backward, 100, 10)
        finch.setTail(
            TailPort.All,
            0,
            0,
            100
        )
    }
})
