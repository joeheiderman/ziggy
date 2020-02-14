enum MoveDir {
    //% block="Forward"
    Forward,
    //% block="Backward"
    Backward
}

enum RLDir {
    //% block="Right"
    Right,
    //% block="Left"
    Left
}

enum TailPort {
    //% block="1"
    One = 1,
    //% block="2"
    Two = 2,
    //% block="3"
    Three = 3,
    //% block="4"
    Four = 4,
    //% block="All"
    All = 5
}

enum AorM {
    //% block="Accelerometer"
    Accelerometer,
    //% block="Magnetometer"
    Magnetometer
}

enum Orientation {
    //% block="Beak Up"
    BeakUp,
    //% block="Beak Down"
    BeakDown,
    //% block="Tilt Left"
    TiltLeft,
    //% block="Tilt Right"
    TiltRight,
    //% block="Level"
    Level,
    //% block="Upside Down"
    UpsideDown,
    //% block="Shake"
    Shake
}


/**
 * Blocks for Controlling a Finch
 */
//% color=#62bcc7 weight=32 icon="\uF0EB"
namespace finch {

    let readyToSend: boolean

    let waitTime_1 = 4
    let waitTime_2 = 100
    let waitTime_Initial = 500
    let waitTime_Start = 2000

    let FILLER_VALUE = 0xFF
    let FILLER_VALUE_2 = 0x00

    //First defining byte of SPI commands
    let STOP_COMMAD = 0xDF
    let SET_LED_COMMAND = 0xD0
    let SET_MOTOR_COMMAND = 0xD2
    let SET_SINGLE_LED_COMMAND = 0xD3
    let GET_WITH_OFFSET = 0xD4
    let RESET_ENCODERS_COMMAND = 0xD5

    //Differnet conversion factors
    let CONVERSION_FACTOR_CM_TICKS = 50.95
    let ANGLE_TICKS_FACTOR = 4.44
    let MINIMUM_SPEED = -127
    let MAXIMUM_SPEED = 127
    let SPEED_CONVERSION_FACTOR = 0.45
    let BATT_FACTOR = 0.40
    let NO_TICKS_ROTATION = 800

    //SPI Pins
    let MOSI_PIN = DigitalPin.P15
    let MISO_PIN = DigitalPin.P14
    let SCK_PIN = DigitalPin.P13
    let SLAVESELECT_PIN = DigitalPin.P16

    let beakLEDR = 0
    let beakLEDG = 0
    let beakLEDB = 0

    let leftEncoderOffset = 0
    let rightEncoderOffset = 0

    let sensor_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  //16 bytes
    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Finch program.
     */
    //% weight=32 blockId="startFN" block="Start Finch"
    export function startFinch(): void {
        pins.analogWritePin(AnalogPin.P0, 0)
        //Wait to complete the bootloader routine
        basic.pause(waitTime_Start);                //To avoid the bootloader
        //Initiliaze the SPI with the respective pins with 1MHz clock
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        pins.spiPins(MOSI_PIN, MISO_PIN, SCK_PIN)
        pins.spiFormat(8, 0)
        pins.spiFrequency(1000000)
        readyToSend = true
        //Send stop if anything is running from previous state of the device
        stop()
        //Reset the encoders which also notes down the current encoder value
        resetEncoders()
        //Clear or do something with neopixel LED
    }

    /**
     * sendCommand - Send one command to the finch. Each command consists of
     * 16 spi writes. If less than 16 values are specified, additional filler
     * values will be added.
     *
     * @param  {number[]} cmdArray       array containing all values to send.
     * @param  {number} fillerVal        value to use as filler
     * @return {number[]}                16 return values from the write commands
     */
    export function sendCommand(cmdArray: number[], fillerVal: number = 0xFF) : number[] {
      if (cmdArray.length > 16) {
        return [];
      } else if (cmdArray.length < 16) {
        for (let i = cmdArray.length; i < 16; i++) {
          cmdArray.push(fillerVal)
        }
      }

      let results = []
      let timeout = 0
      while (!readyToSend && timeout < 25) {
          basic.pause(10)
          timeout++;
      }

      if (readyToSend) {
        readyToSend = false
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(SLAVESELECT_PIN, 0)
        control.waitMicros(waitTime_1)

        for (let i = 0; i < 15; i++) {
          results[i] = pins.spiWrite(cmdArray[i])
          control.waitMicros(waitTime_2)
        }
        results[15] = pins.spiWrite(cmdArray[15])

        control.waitMicros(waitTime_1)
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        readyToSend = true
      }

      return results
    }

    /**
     * Stop Command
     */
    export function stop(): void {
        sendCommand([STOP_COMMAD])
    }

    /**
     * sendAllLEDs - Utiltity function to send the LED command to set all beak
     * and tail LEDs at once. Only the tail LEDs will be set to the value
     * specified. Beak LED will be set using the global variable.
     *
     * @param  {number} red           red intensity
     * @param  {number} green         green intensity
     * @param  {number} blue          blue intensity
     */
    export function sendAllLEDs(red: number, green: number, blue: number): void {
        sendCommand([SET_LED_COMMAND, beakLEDR, beakLEDG, beakLEDB, red, green,
          blue, red, green, blue, red, green, blue, red, green, blue])
    }

    /**
     * sendSingleLED - Send a command to set a single LED
     *
     * @param  {number} portNumber       the position of the LED to set
     * @param  {number} red              red intensity
     * @param  {number} green: number    green intensity
     * @param  {number} blue: number     blue intensity
     */
    export function sendSingleLED(portNumber: number, red: number, green: number, blue: number): void {
        sendCommand([SET_SINGLE_LED_COMMAND, portNumber, red, green, blue], FILLER_VALUE_2)
    }

    /**
     * capToBounds - Restrict a value between min and max values
     *
     * @param  {number} value       value to be capped
     * @param  {number} min         minimum value
     * @param  {number} max         maximum value
     * @return {number}             the final number
     */
    export function capToBounds(value: number, min: number, max: number) : number {
      return Math.min(Math.max(value, min), max)
    }

    /**
     * Sets the tri-color LED in the Finch beak to the color specified by red,
     * green, and blue brightness values. The values range from 0% to 100%.
     * @param {number} red     the % brightness of the red LED element [0-100]
     * @param {number} green   the % brightness of the green LED element [0-100]
     * @param {number} blue    the % brightness of the blue LED element [0-100]
     */
    //% weight=29 blockId="setBeak" block="Finch Beak Red %red| Green %green| Blue %blue|"
    //% red.min=0 red.max=100
    //% green.min=0 green.max=100
    //% blue.min=0 blue.max=100
    export function setBeak(red: number = 50, green: number = 0, blue: number = 50): void {
        let portNumber = 0
        beakLEDR = (capToBounds(red, 0, 100)) * 255 / 100
        beakLEDG = (capToBounds(green, 0, 100)) * 255 / 100
        beakLEDB = (capToBounds(blue, 0, 100)) * 255 / 100

        sendSingleLED(portNumber, beakLEDR, beakLEDG, beakLEDB)
    }

    /**
     * Sets one or all of the tri-color LEDs in the Finch tail to the color
     * specified by red, green, and blue brightness values. The values range
     * from 0% to 100%.
     * @param {TailPort} port  Tail position to set (1, 2, 3, 4 or all)
     * @param {number} red     the % brightness of the red LED element [0-100]
     * @param {number} green   the % brightness of the green LED element [0-100]
     * @param {number} blue    the % brightness of the blue LED element [0-100]
     */
    //% weight=28 blockId="setTail" block="Finch Tail %port| Red %red| Green %green| Blue %blue|"
    //% inlineInputMode=inline
    //% red.min=0 red.max=100
    //% green.min=0 green.max=100
    //% blue.min=0 blue.max=100
    export function setTail(port: TailPort, red: number = 50, green: number = 0, blue: number = 50): void {
        red = (capToBounds(red, 0, 100)) * 255 / 100
        green = (capToBounds(green, 0, 100)) * 255 / 100
        blue = (capToBounds(blue, 0, 100)) * 255 / 100

        if (port == TailPort.All) {
              sendAllLEDs(red, green, blue)
        } else {
              sendSingleLED(port, red, green, blue)
        }
    }

    /**
     * sendMotor - Sends finch motor command
     *
     * @param  {number} l_velocity         left velocity
     * @param  {number} l_dist             left distance (ticks)
     * @param  {number} r_velocity         right velocity
     * @param  {number} r_dist: number     right distance (ticks)
     */
    export function sendMotor(l_velocity: number, l_dist: number, r_velocity: number, r_dist: number): void {

        let l_ticks_3 = (l_dist & 0xFF0000) >> 16
        let l_ticks_2 = (l_dist & 0x00FF00) >> 8
        let l_ticks_1 = l_dist & 0x0000FF
        let r_ticks_3 = (r_dist & 0xFF0000) >> 16
        let r_ticks_2 = (r_dist & 0x00FF00) >> 8
        let r_ticks_1 = r_dist & 0x0000FF

        sendCommand([SET_MOTOR_COMMAND, FILLER_VALUE, l_velocity, l_ticks_3,
          l_ticks_2, l_ticks_1, r_velocity, r_ticks_3, r_ticks_2, r_ticks_1])
    }

    /**
     * Moves the Finch forward or back a given distance at a given speed (0-100%).
     * @param  {MoveDir} direction   Forward or Backward
     * @param  {number}  distance    the discance to travel in cm, eg:10
     * @param  {number}  speed       the speed as a percent for the motor [0 to 40], eg:50
     */
    //% weight=27 blockId="setMove" block="Finch Move %direction| %distance|cm at %speed| \\%"
    //% speed.min=0 speed.max=100
    export function setMove(direction: MoveDir, distance: number = 10, speed: number = 50): void {
        let velocity = 0
        let tick_speed = 0
        let positionControlFlag = 0

        speed = Math.round(capToBounds(speed, MINIMUM_SPEED, MAXIMUM_SPEED) * SPEED_CONVERSION_FACTOR)
        distance = Math.round(distance * CONVERSION_FACTOR_CM_TICKS)
        if (direction == MoveDir.Forward) {
            velocity = (0x80 | speed);
        }
        else if (direction == MoveDir.Backward) {
            velocity = (0x7F & speed);
        }
        sendMotor(velocity, distance, velocity, distance)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
        }
    }
    /**
     * Turns the Finch right or left a given angle at a given speed (0-100%).
     * @param  {RLDir}  direction   Right or Left
     * @param  {number} angle       the angle to turn in degrees,eg:90
     * @param  {number} speed       the speed as a percent for the motor [0 to 100],eg:50
     */
    //% weight=26 blockId="setTurn" block="Finch Turn %direction| %angle|° at %speed| \\%"
    //% speed.min=0 speed.max=100
    //% angle.min=0 angle.max=180
    export function setTurn(direction: RLDir, angle: number = 90, speed: number = 50): void {
        let r_speed = 0
        let l_speed = 0
        let r_dist = 0
        let l_dist = 0
        let positionControlFlag = 0;
        l_dist = Math.round(ANGLE_TICKS_FACTOR * angle)
        r_dist = Math.round(ANGLE_TICKS_FACTOR * angle)
        speed = Math.round(capToBounds(speed, MINIMUM_SPEED, MAXIMUM_SPEED) * SPEED_CONVERSION_FACTOR)

        if (direction == RLDir.Left) {
            l_speed = (0x7F & speed);
            r_speed = (0x80 | speed);
        } else {
            l_speed = (0x80 | speed);
            r_speed = (0x7F & speed);
        }

        sendMotor(l_speed, l_dist, r_speed, r_dist)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
        }
    }

    /**
     * Sets the rotation speeds of the left and right Finch wheels to values from -100 to 100%.
     * @param  {number} l_speed the speed of the left motor
     * @param  {number} r_speed the speed of the right motor
     */
    //% weight=25 blockId="startMotors" block="Finch Wheels L %l_speed| \\% R %r_speed| \\%"
    //% l_speed.min=-100 l_speed.max=100
    //% r_speed.min=-100 r_speed.max=100
    export function startMotors(l_speed: number = 50, r_speed: number = 50): void {
        //convert
        let l_velocity = 0
        let r_velocity = 0

        let l_tick_speed = 0
        let r_tick_speed = 0


        //Left Motor
        l_speed = capToBounds(l_speed, MINIMUM_SPEED, MAXIMUM_SPEED)
        l_tick_speed = Math.round(Math.abs(l_speed) * SPEED_CONVERSION_FACTOR)
        if (l_speed > 0) {
            l_velocity = (0x80 | l_tick_speed);
        }
        else {
            l_velocity = (0x7F & l_tick_speed);
        }

        //Right Motor
        r_speed = capToBounds(r_speed, MINIMUM_SPEED, MAXIMUM_SPEED)
        r_tick_speed = Math.round(Math.abs(r_speed) * SPEED_CONVERSION_FACTOR)
        if (r_speed >= 0) {
            r_velocity = (0x80 | r_tick_speed);
        }
        else {
            r_velocity = (0x7F & r_tick_speed);
        }
        sendMotor(l_velocity, 0, r_velocity, 0)
    }

    /**
     * Stops the Finch wheels.
     */
    //% weight=24 blockId="stopMotors" block="Finch Stop"
    export function stopMotors(): void {
        sendMotor(0, 1, 0, 1)
        stop()
    }

    /**
     * Reads the value of the sensors. Resulting array contains:
     * [Firmware version, nothing, distance msb, distance lsb, light left,
     * light right, line left, line right, battery, enc3 left, enc2 left,
     * enc1 left, enc3 right, enc2 right, enc1 right, Filler Value]
     */
    export function getSensors(): void {
        let sv = sendCommand([GET_WITH_OFFSET])
        if (sv.length != 0) {
          sensor_vals = sv
        }
    }

    /**
     * Reads the distance to the closest obstacle in centimeters.
     * @return  {number}  finch distance sensor reading in cm
     */
    //% weight=23 blockId="getDistance" block="Finch Distance (cm)"
    export function getDistance(): number {
        getSensors()
        // Scale distance value to cm
        let return_val = ((sensor_vals[2] << 8 | sensor_vals[3]) * 0.0919)
        return Math.round(return_val)
    }

    /**
     * Reads the value of the right or left Finch light sensor from 0 to 100.
     * @param  {RLDir} light Right or Left
     * @return {number}      finch light sensor reading
     */
    //% weight=22 blockId="getLight" block="Finch %light| Light"
    export function getLight(light: RLDir): number {
        getSensors()
        let return_val = 0
        if (light == RLDir.Right) {
            return_val = sensor_vals[5]
        } else {
            return_val = sensor_vals[4]
        }
        return_val = return_val * 100 / 255
        return Math.round(return_val)
    }

    /**
     * Reads the value of the right or left Finch line tracking sensor from
     * 0 to 100. White = higher number
     * @param  {RLDir} line Right or Left
     * @return {number}     finch line sensor reading
     */
    //% weight=21 blockId="getLine" block="Finch %line| Line"
    export function getLine(line: RLDir): number {
        getSensors()
        let return_val = 0
        if (line == RLDir.Right) {
            return_val = (sensor_vals[7] & 0x7F)
        } else {
            return_val = (sensor_vals[6] & 0x7F)
        }
        return_val = 100 - (return_val * 100 / 127)
        return Math.round(return_val)
    }

    /**
     * Sets the value of the left and right Finch wheel encoders to zero.
     */
    //% weight=20 blockId="resetEncoders" block="Finch Reset Encoders"
    export function resetEncoders(): void {
        sendCommand([RESET_ENCODERS_COMMAND])
    }

    /**
     * Reads the finch position control flag
     * @return  {number}  1 if the finch is still moving, otherwise 0
     */
    export function getPositionControlFlag(): number {
        getSensors()
        let return_val = 0
        return_val = ((sensor_vals[6] & 0x80) >> 7)
        return return_val
    }

    /**
     * Reads the number of rotations that the right or left wheel has turned.
     * @param  {RLDir} encoder   Right or Left
     */
    //% weight=19 blockId="getEncoder" block="Finch %encoder| Encoder"
    export function getEncoder(encoder: RLDir): number {
        getSensors()
        let return_val = 0
        if (encoder == RLDir.Right) {
            return_val = (sensor_vals[12] << 16 | sensor_vals[13] << 8 | sensor_vals[14])
        } else {
            return_val = (sensor_vals[9] << 16 | sensor_vals[10] << 8 | sensor_vals[11])
        }

        if (return_val >= 0x800000) {
            return_val = return_val | 0xFF000000;
        }

        return_val = (return_val / NO_TICKS_ROTATION)
        Math.roundWithPrecision(return_val, 4)
        return return_val
    }

    /**
     * Reads the value of the battery in milliVolts. You may start to see
     * strange behavior when the value is below 4630 mV.
     * @return  {number}  battery charge in mV
     */
    //% weight=18 blockId="getBattery" block="Finch Battery"
    export function getBattery(): number {
        getSensors()
        let return_val = BATT_FACTOR * (sensor_vals[8]) / 10
        return Math.round(return_val)
    }

    /**
     * Reads the value of the Accelerometer or Magnetometer and reports it
     * in the finch reference frame.
     * @param  {AorM}      type    Accelerometer or Magnetometer
     * @param  {Dimension} dim     Dimension to read - x, y, z, or strength
     * @return {number}            value of accelerometer or magnetometer requested
     */
    //% weight=17 blockId="getFinchAM" block="Finch %type| %dim|"
    export function getFinchAM(type: AorM, dim: Dimension): number {
      switch (type) {
        case AorM.Accelerometer:
          return getFinchAccel(dim)
        case AorM.Magnetometer:
          return getFinchMag(dim)
      }
    }

    /**
     * Reads the value of the Accelerometer and reports it
     * in the finch reference frame.
     * X-finch = x-micro:bit
     * Y-finch = y-micro:bit*cos 40° - z-micro:bit*sin 40°
     * Z-finch = y-micro:bit*sin 40° + z-micro:bit* cos 40°
     * @param  {Dimension} dim  Dimension to read - x, y, z, or strength
     * @return  {number}        accelerometer value in mg
     */
    export function getFinchAccel(dim: Dimension): number {
      switch (dim) {
        case Dimension.Strength:
        case Dimension.X:   //both dim x and strength report the microbit value
          return -(input.acceleration(dim))
        case Dimension.Y:
        case Dimension.Z:
          const mbY = -(input.acceleration(Dimension.Y))
          const mbZ = input.acceleration(Dimension.Z)
          const rad = 40 * Math.PI / 180 //40° in radians

          let accVal = 0
          switch(dim) {
            case Dimension.Y:
              accVal = (mbY*Math.cos(rad) - mbZ*Math.sin(rad))
              break;
            case Dimension.Z:
              accVal = (mbY*Math.sin(rad) + mbZ*Math.cos(rad))
              break;
          }
          return accVal
      }
    }

    /**
     * Reads the value of the Magnetometer and reports it
     * in the finch reference frame.
     * X-finch = x-micro:bit
     * Y-finch = y-micro:bit*cos 40° + z-micro:bit*sin 40°
     * Z-finch = z-micro:bit* cos 40° - y-micro:bit*sin 40°
     * @param  {Dimension} dim Dimension to read - x, y, z, or strength
     * @return  {number}       magnetometer value in uT
     */
    export function getFinchMag(dim: Dimension): number {
      switch (dim) {
        case Dimension.Strength:
        case Dimension.X:   //both dim x and strength report the microbit value
          return -(input.magneticForce(dim))
        case Dimension.Y:
        case Dimension.Z:
          const mbY = -(input.magneticForce(Dimension.Y))
          const mbZ = -(input.magneticForce(Dimension.Z))
          const rad = 40 * Math.PI / 180 //40° in radians

          let magVal = 0
          switch(dim) {
            case Dimension.Y:
              magVal = (mbY*Math.cos(rad) + mbZ*Math.sin(rad))
              break;
            case Dimension.Z:
              magVal = (mbZ*Math.cos(rad) - mbY*Math.sin(rad))
              break;
          }
          return magVal
      }
    }

    /**
     * Reads the value of the compass in the finch reference frame
     * @return  {number}    compass heading in degrees
     */
    //% weight=16 blockId="getFinchCompass" block="Finch Compass"
    export function getFinchCompass(): number {
      const ax = getFinchAccel(Dimension.X)
      const ay = getFinchAccel(Dimension.Y)
      const az = getFinchAccel(Dimension.Z)
      const mx = getFinchMag(Dimension.X)
      const my = getFinchMag(Dimension.Y)
      const mz = getFinchMag(Dimension.Z)

      const phi = Math.atan(-ay / az)
      const theta = Math.atan(ax / (ay * Math.sin(phi) + az * Math.cos(phi)))

      const xp = mx
      const yp = my * Math.cos(phi) - mz * Math.sin(phi)
      const zp = my * Math.sin(phi) + mz * Math.cos(phi)

      const xpp = xp * Math.cos(theta) + zp * Math.sin(theta)
      const ypp = yp

      const angle = 180.0 + ((Math.atan2(xpp, ypp)) * (180 / Math.PI)) //convert result to degrees

      return ((Math.round(angle) + 180) % 360) //turn so that beak points north
    }

    /**
     * Reads the value of the Accelerometer and returns true if the finch is
     * in the given orientation.
     * @param   {Orientation} orientation  finch orientation
     * @return  {boolean}   true if the finch is in the specified position
     */
    //% weight=15 blockId="getFinchOrientation" block="Finch %orientation|"
    export function getFinchOrientation(orientation: Orientation): boolean {
      const threshold = 800 //0.8g
      switch(orientation){
        case Orientation.BeakUp:
          return (getFinchAccel(Dimension.Y) > threshold)
        case Orientation.BeakDown:
          return (getFinchAccel(Dimension.Y) < -threshold)
        case Orientation.TiltLeft:
          return (getFinchAccel(Dimension.X) > threshold)
        case Orientation.TiltRight:
          return (getFinchAccel(Dimension.X) < -threshold)
        case Orientation.Level:
          return (getFinchAccel(Dimension.Z) < -threshold)
        case Orientation.UpsideDown:
          return (getFinchAccel(Dimension.Z) > threshold)
        case Orientation.Shake:
          return input.isGesture(Gesture.Shake)
      }
    }
}
