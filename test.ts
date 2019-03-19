// tests go here; this will not be compiled when this package is used as a library
input.onButtonPressed(Button.A, function () {
    basic.showNumber(hummingbird.getBattery())
})
hummingbird.startHummingbird()
basic.forever(function () {
    if (hummingbird.getSensor(SensorType.Light, ThreePort.One) < 10) {
        hummingbird.setLED(ThreePort.One, 100)
        hummingbird.setPositionServo(FourPort.One, 180)
        hummingbird.setRotationServo(FourPort.Two, 100)
        hummingbird.setTriLED(
            TwoPort.One,
            100,
            0,
            100
        )
    } else {
        hummingbird.setLED(ThreePort.One, 0)
        hummingbird.setPositionServo(FourPort.One, 0)
        hummingbird.setRotationServo(FourPort.Two, 0)
        hummingbird.setTriLED(
            TwoPort.One,
            0,
            0,
            0
        )
    }
})