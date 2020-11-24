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
    //% block="Accelerometer (m/s²)"
    Accelerometer,
    //% block="Magnetometer (μT)"
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

    //Different conversion factors
    let CONVERSION_FACTOR_CM_TICKS = 49.7
    let ANGLE_TICKS_FACTOR = 4.335
    let MINIMUM_SPEED = -100
    let MAXIMUM_SPEED = 100
    let SPEED_CONVERSION_FACTOR = 0.36
    let BATT_FACTOR = 9.37
    let NO_TICKS_ROTATION = 792
    let CONVERSION_FACTOR_MG_TO_MPS = 0.00980665 //convert mg to meters per second squared

    //SPI Pins
    let MOSI_PIN = DigitalPin.P15
    let MISO_PIN = DigitalPin.P14
    let SCK_PIN = DigitalPin.P13
    let SLAVESELECT_PIN = DigitalPin.P16
    let RESET_PIN = DigitalPin.P2

    let beakLEDR = 0
    let beakLEDG = 0
    let beakLEDB = 0

    let sensor_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];  //16 bytes
    let last_sensor_read = 0
    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Finch program. Put it in the on start
     * block.
     */
    //% weight=32 blockId="startFN" block="Start Finch"
    export function startFinch(): void {
		    //Buzzer pin
        pins.analogWritePin(AnalogPin.P0, 0)
        //Reset pin, necessary for resetting during a lock state and also important to pull this line low
        pins.digitalWritePin(RESET_PIN, 1)
        basic.pause(100);
        pins.digitalWritePin(RESET_PIN, 0)
        //Reset Pin
        //Wait to complete the bootloader routine
        basic.pause(waitTime_Start);                //To avoid the bootloader
        //Initialize the SPI with the respective pins with 1MHz clock
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

        //Send one command to explicitly get sensor values. That way, the
        // firmware knows that this is a MakeCode program.
        sendCommand([GET_WITH_OFFSET])
	// If a V2 micro:bit, turn off the speaker
    	// music.setBuiltInSpeakerEnabled(false)
    }

    /**
     * sendCommand - Send one command to the finch. Each command consists of
     * 16 spi writes. If less than 16 values are specified, additional filler
     * values will be added.
     *
     * @param cmdArray       array containing all values to send.
     * @param fillerVal      value to use as filler
     */
    export function sendCommand(cmdArray: number[], fillerVal: number = 0xFF) : void {
      if (cmdArray.length > 16) {
        return
      } else if (cmdArray.length < 16) {
        for (let i = cmdArray.length; i < 16; i++) {
          cmdArray.push(fillerVal)
        }
      }

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

        let results = []
        for (let i = 0; i < 15; i++) {
          results[i] = pins.spiWrite(cmdArray[i])
          control.waitMicros(waitTime_2)
        }
        results[15] = pins.spiWrite(cmdArray[15])
        sensor_vals = results
        last_sensor_read = input.runningTime()

        control.waitMicros(waitTime_1)
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        readyToSend = true
      }
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
     * @param red           red intensity
     * @param green         green intensity
     * @param blue          blue intensity
     */
    export function sendAllLEDs(red: number, green: number, blue: number): void {
        sendCommand([SET_LED_COMMAND, beakLEDR, beakLEDG, beakLEDB, red, green,
          blue, red, green, blue, red, green, blue, red, green, blue])
    }

    /**
     * sendSingleLED - Send a command to set a single LED
     *
     * @param portNumber       the position of the LED to set
     * @param red              red intensity
     * @param green: number    green intensity
     * @param blue: number     blue intensity
     */
    export function sendSingleLED(portNumber: number, red: number, green: number, blue: number): void {
        sendCommand([SET_SINGLE_LED_COMMAND, portNumber, red, green, blue], FILLER_VALUE_2)
    }

    /**
     * capToBounds - Restrict a value between min and max values
     *
     * @param value       value to be capped
     * @param min         minimum value
     * @param max         maximum value
     * @return            the final number
     */
    export function capToBounds(value: number, min: number, max: number) : number {
      return Math.min(Math.max(value, min), max)
    }

    /**
     * Sets the tri-color LED in the Finch beak  to the color specified by red,
     * green, and blue brightness values. The values range from 0% to 100%.
     * @param red     the % brightness of the red LED element [0-100]
     * @param green   the % brightness of the green LED element [0-100]
     * @param blue    the % brightness of the blue LED element [0-100]
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
     * @param port    Tail position to set (1, 2, 3, 4 or all)
     * @param red     the % brightness of the red LED element [0-100]
     * @param green   the % brightness of the green LED element [0-100]
     * @param blue    the % brightness of the blue LED element [0-100]
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
     * @param l_velocity         left velocity
     * @param l_dist             left distance (ticks)
     * @param r_velocity         right velocity
     * @param r_dist: number     right distance (ticks)
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
     * convertSpeed - Takes a speed percent and converts it to the appropriate
     * value to send to the finch.
     *
     * @param  speed     percent speed (-100 to 100)
     * @return           raw speed value
     */
    export function convertSpeed(speed: number) {
        let bounded = capToBounds(speed, MINIMUM_SPEED, MAXIMUM_SPEED)
        let converted = Math.round(Math.abs(bounded) * SPEED_CONVERSION_FACTOR)
        if (converted != 0 && converted < 3) { converted = 3 }

        let raw = 0
        if (speed >= 0) {
          raw = (0x80 | converted)
        } else {
          raw = (0x7F & converted)
        }
        return raw
    }

    /**
     * Moves the Finch forward or back for a given distance at a given speed
     * (0-100%).
     * @param direction   Forward or Backward
     * @param distance    the discance to travel in cm, eg:10
     * @param speed       the speed as a percent for the motor [0 to 40], eg:50
     */
    //% weight=27 blockId="setMove" block="Finch Move %direction| %distance|cm at %speed| \\%"
    //% speed.min=0 speed.max=100
    //% distance.min=0 distance.max=50
    export function setMove(direction: MoveDir, distance: number = 10, speed: number = 50): void {
        let velocity = 0
        let tick_speed = 0
        let positionControlFlag = 0

        distance = Math.round(capToBounds(distance, 0, 10000) * CONVERSION_FACTOR_CM_TICKS)
        if (distance == 0) { return; } //ticks=0 is the motor command for continuous motion. Must exit early so that command is not sent.

        if (direction == MoveDir.Forward) {
            velocity = convertSpeed(speed);
        }
        else if (direction == MoveDir.Backward) {
            velocity = convertSpeed(-speed);
        }
        sendMotor(velocity, distance, velocity, distance)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
        }
        //compensate for firmware bug
        stopMotors()
        basic.pause(100)
    }
    /**
     * Turns the Finch right or left a given angle at a given speed (0-100%).
     * @param direction   Right or Left
     * @param angle       the angle to turn in degrees,eg:90
     * @param speed       the speed as a percent for the motor [0 to 100],eg:50
     */
    //% weight=26 blockId="setTurn" block="Finch Turn %direction| %angle|° at %speed| \\%"
    //% speed.min=0 speed.max=100
    //% angle.min=0 angle.max=180
    export function setTurn(direction: RLDir, angle: number = 90, speed: number = 50): void {
        let r_speed = 0
        let l_speed = 0
        let positionControlFlag = 0;
        const dist = Math.round(ANGLE_TICKS_FACTOR * capToBounds(angle, 0, 360000))
        if (dist == 0) { return; } //ticks=0 is the motor command for continuous motion. Must exit early so that command is not sent.

        if (direction == RLDir.Left) {
            l_speed = convertSpeed(-speed);
            r_speed = convertSpeed(speed);
        } else {
            l_speed = convertSpeed(speed);
            r_speed = convertSpeed(-speed);
        }

        sendMotor(l_speed, dist, r_speed, dist)
        basic.pause(50)
        positionControlFlag = getPositionControlFlag()
        while (positionControlFlag == 1) {
            positionControlFlag = getPositionControlFlag()
            basic.pause(30)
        }
        //compensate for firmware bug
        stopMotors()
        basic.pause(100)
    }

    /**
     * Sets the rotation speeds of the left and right Finch wheels to values
     * from -100 to 100%.
     * @param l_speed the speed of the left motor
     * @param r_speed the speed of the right motor
     */
    //% weight=25 blockId="startMotors" block="Finch Wheels L %l_speed| \\% R %r_speed| \\%"
    //% l_speed.min=-100 l_speed.max=100
    //% r_speed.min=-100 r_speed.max=100
    export function startMotors(l_speed: number = 50, r_speed: number = 50): void {
        //convert
        let l_velocity = convertSpeed(l_speed)
        let r_velocity = convertSpeed(r_speed)

        sendMotor(l_velocity, 0, r_velocity, 0)
    }

    /**
     * Stops the Finch wheels.
     */
    //% weight=24 blockId="stopMotors" block="Finch Stop"
    export function stopMotors(): void {
        sendMotor(0, 0, 0, 0)
    }

    /**
     * Reads the value of the sensors. Resulting array contains:
     * [Firmware version, nothing, distance msb, distance lsb, light left,
     * light right, line left, line right, battery, enc3 left, enc2 left,
     * enc1 left, enc3 right, enc2 right, enc1 right, Filler Value]
     */
    export function getSensors(): void {
        if (input.runningTime() - last_sensor_read > 10) { //if last read was more than 10 ms ago
          sendCommand([GET_WITH_OFFSET])
        }
    }

    /**
     * Returns the value of the Finch distance sensor in cm.
     */
    //% weight=23 blockId="getDistance" block="Finch Distance (cm)"
    export function getDistance(): number {
        getSensors()
        // Scale distance value to cm
        let return_val = ((sensor_vals[2] << 8 | sensor_vals[3]) * 0.0919)
        return Math.round(return_val)
    }

    /**
     * Returns the value of the right or left Finch light sensor from 0 to 100.
     * @param light  Right or Left
     */
    //% weight=22 blockId="getLight" block="Finch %light| Light"
    export function getLight(light: RLDir): number {
        getSensors()
        const R = beakLEDR * 100 / 255
        const G = beakLEDG * 100 / 255
        const B = beakLEDB * 100 / 255
        let raw_val = 0
        let correction = 0
        if (light == RLDir.Right) {
            raw_val = sensor_vals[5]
            correction = 6.40473070e-03*R + 1.41015162e-02*G + 5.05547817e-02*B + 3.98301391e-04*R*G + 4.41091223e-04*R*B + 6.40756862e-04*G*B + -4.76971242e-06*R*G*B
        } else {
            raw_val = sensor_vals[4]
            correction = 1.06871493e-02*R + 1.94526614e-02*G + 6.12409825e-02*B + 4.01343475e-04*R*G + 4.25761981e-04*R*B + 6.46091068e-04*G*B + -4.41056971e-06*R*G*B
        }
        return Math.round( capToBounds((raw_val - correction), 0, 100) )
    }

    /**
     * Returns the value of the right or left Finch line tracking sensor from
     * 0 to 100.
     * @param line  Right or Left
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
        return_val = 100 - ((return_val - 6) * 100 / 121)
        return Math.round(return_val)
    }

    /**
     * Sets the value of the left and right encoders to zero.
     */
    //% weight=20 blockId="resetEncoders" block="Finch Reset Encoders"
    export function resetEncoders(): void {
        sendCommand([RESET_ENCODERS_COMMAND])
        basic.pause(100)
    }

    /**
     * Reads the finch position control flag
     * @return  1 if the finch is still moving, otherwise 0
     */
    export function getPositionControlFlag(): number {
        getSensors()
        let return_val = 0
        return_val = ((sensor_vals[6] & 0x80) >> 7)
        return return_val
    }

    /**
     * Returns the number of rotations that the right or left wheel has turned.
     * @param encoder   Right or Left
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

        return Math.roundWithPrecision(return_val, 1)
    }

    /**
     * Reads the value of the battery in milliVolts. You may start to see
     * strange behavior when the value is below 3373 mV.
     */
    //% weight=15 blockId="getBattery" block="Finch Battery"
    export function getBattery(): number {
        getSensors()
        let return_val = BATT_FACTOR * (sensor_vals[8] + 320)
        return Math.round(return_val)
    }

    /**
     * Returns the value of the Finch accelerometer or magnetometer in the
     * x, y, or z direction.
     * @param  type    Accelerometer or Magnetometer
     * @param  dim     Dimension to read - x, y, z, or strength
     */
    //% weight=16 blockId="getFinchAM" block="Finch %type| %dim|"
    export function getFinchAM(type: AorM, dim: Dimension): number {
      switch (type) {
        case AorM.Accelerometer:
          return Math.round(getFinchAccel(dim) * CONVERSION_FACTOR_MG_TO_MPS * 10) / 10
        case AorM.Magnetometer:
          return Math.round( getFinchMag(dim) )
      }
    }

    /**
     * Reads the value of the Accelerometer and reports it
     * in the finch reference frame.
     * X-finch = x-micro:bit
     * Y-finch = y-micro:bit*cos 40° - z-micro:bit*sin 40°
     * Z-finch = y-micro:bit*sin 40° + z-micro:bit* cos 40°
     * @param  dim  Dimension to read - x, y, z, or strength
     * @return      accelerometer value in mg
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
     * @param dim   Dimension to read - x, y, z, or strength
     * @return      magnetometer value in uT
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
     * Returns the value of the Finch compass in degrees.
     */
    //% weight=17 blockId="getFinchCompass" block="Finch Compass"
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
     * Returns a Boolean value that indicates whether or not the Finch is in
     * the selected position.
     * @param  orientation  finch orientation
     */
    //% weight=18 blockId="getFinchOrientation" block="Finch %orientation|"
    export function getFinchOrientation(orientation: Orientation): boolean {
      const threshold = 800 //0.8g
      switch(orientation){
        case Orientation.BeakUp:
          return (getFinchAccel(Dimension.Y) > threshold)
        case Orientation.BeakDown:
          return (getFinchAccel(Dimension.Y) < -threshold)
        case Orientation.TiltLeft:
          return (getFinchAccel(Dimension.X) < -threshold)
        case Orientation.TiltRight:
          return (getFinchAccel(Dimension.X) > threshold)
        case Orientation.Level:
          return (getFinchAccel(Dimension.Z) < -threshold)
        case Orientation.UpsideDown:
          return (getFinchAccel(Dimension.Z) > threshold)
        case Orientation.Shake:
          return input.isGesture(Gesture.Shake)
      }
    }
}
