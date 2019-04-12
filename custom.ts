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
    let STOP_COMMAD = 0xDF
    let SET_BEAKLED_COMMAND = 0xD0
    let SET_MOTOR_COMMAND = 0xD2
    let MOSI_PIN = DigitalPin.P15
    let MISO_PIN = DigitalPin.P14
    let SCK_PIN = DigitalPin.P13
    let SLAVESELECT_PIN = DigitalPin.P16

    let tailPin: DigitalPin = DigitalPin.P2
    let tailBuf: Buffer
    let buzzerPin: DigitalPin = DigitalPin.P0

    let sensor_vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //15 bytes
    readyToSend = false // to prevent sending or attempting to receive data until we have initialized the connection


    /**
     * This block is required for every Finch program.
     */
    //% weight=32 blockId="startFN" block="Start Finch"
    export function startFinch(): void {

        pins.analogWritePin(AnalogPin.P0, 0)
        basic.pause(waitTime_Start);                //To avoid the bootloader
        //Temporary MOSI and SS interchage
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        pins.spiPins(MOSI_PIN, MISO_PIN, SCK_PIN)
        pins.spiFormat(8, 0)
        pins.spiFrequency(1000000)
        stop()
        readyToSend = true
        //Clear or do something with neopixel LEDs

        //Setup for tail LEDs
        tailBuf = pins.createBuffer(12) //buffer to hold rgb values for tail LEDs
        tailBuf.fill(0, 0, 12)
        pins.digitalWritePin(tailPin, 0);
    }

    //Stop Command
    export function stop(): void {
        control.waitMicros(waitTime_Initial)
        pins.digitalWritePin(SLAVESELECT_PIN, 0)
        control.waitMicros(waitTime_1)
        pins.spiWrite(STOP_COMMAD)                  //1
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //2
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //3
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //4
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //5
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //6
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //7
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //8
        control.waitMicros(waitTime_2)
        pins.spiWrite(FILLER_VALUE)                 //9
        control.waitMicros(waitTime_1)
        pins.digitalWritePin(SLAVESELECT_PIN, 1)
        //control.waitMicros(1000)

    }

    /**
     * Sets the tri-color LED in the beak to the color specified by red, green, and blue brightness values. The values range from 0% to 100%.
     * @param red the % brightness of the red LED element [0-100]
     * @param green the % brightness of the green LED element [0-100]
     * @param blue the % brightness of the blue LED element [0-100]
     */
    //% weight=29 blockId="setBeak" block="Finch Beak Red %Red| Green %Green| Blue %Blue|"
    //% Red.min=0 Red.max=100
    //% Green.min=0 Green.max=100
    //% Blue.min=0 Blue.max=100
    export function setBeak(red: number = 50, green: number = 0, blue: number = 50): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {

            if (red > 100)
                red = 100
            if (red < 0)
                red = 0
            if (green > 100)
                green = 100
            if (green < 0)
                green = 0
            if (blue > 100)
                blue = 100
            if (blue < 0)
                blue = 0

            red = red * 255 / 100
            green = green * 255 / 100
            blue = blue * 255 / 100

            while (!readyToSend); // Wait for other functions in other threads
            readyToSend = false
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(SLAVESELECT_PIN, 0)
            control.waitMicros(waitTime_1)
            pins.spiWrite(SET_BEAKLED_COMMAND)                              // 1
            control.waitMicros(waitTime_2)
            pins.spiWrite(red)                                              // 2
            control.waitMicros(waitTime_2)
            pins.spiWrite(green)                                            // 3
            control.waitMicros(waitTime_2)
            pins.spiWrite(blue)                                            // 4
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                     // 5
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                     // 6
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                     // 7
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                     // 8
            control.waitMicros(waitTime_2)
            pins.spiWrite(FILLER_VALUE)                                     // 9
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(SLAVESELECT_PIN, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Sets the color of one or all of the tail leds
     * @param port
     * @param red the % brightness of the red LED element [0-100]
     * @param green the % brightness of the green LED element [0-100]
     * @param blue the % brightness of the blue LED element [0-100]
     */
    //% weight=28 blockId="setTail" block="Finch Tail %port| Red %Red| Green %Green| Blue %Blue|"
    //% Red.min=0 Red.max=100
    //% Green.min=0 Green.max=100
    //% Blue.min=0 Blue.max=100
    export function setTail(port: TailPort, red: number = 50, green: number = 0, blue: number = 50): void {

      if (port === TailPort.All){
        for (let i = 0; i < 4; i++) {
          tailBuf[i*3 + 1] = red*255/100
          tailBuf[i*3 + 0] = green*255/100
          tailBuf[i*3 + 2] = blue*255/100
        }
      } else {
        tailBuf[(port-1)*3 + 1] = red*255/100
        tailBuf[(port-1)*3 + 0] = green*255/100
        tailBuf[(port-1)*3 + 2] = blue*255/100
      }
      ws2812b.sendBuffer(tailBuf, tailPin);
    }


    /**
     * Sends finch motor command
     */
    //Minumum speed  -- 0  cm/sec
    //Maximum Speed  -- 58 cm/sec
    export function sendMotor(l_velocity: number, l_dist: number, r_velocity: number, r_dist: number): void {

        let CONVERSION_FACTOR_CM_TICKS = 52.63
        let l_dist_ticks = 0
        let r_dist_ticks = 0


        //Assuming distance in cm
        l_dist_ticks = Math.round(l_dist * CONVERSION_FACTOR_CM_TICKS)
        r_dist_ticks = Math.round(r_dist * CONVERSION_FACTOR_CM_TICKS)

        //TODO: Convert distance to ticks
        let l_ticks_3 = (l_dist_ticks & 0xFF0000) >> 16
        let l_ticks_2 = (l_dist_ticks & 0x00FF00) >> 8
        let l_ticks_1 = l_dist_ticks & 0x0000FF
        let r_ticks_3 = (r_dist_ticks & 0xFF0000) >> 16
        let r_ticks_2 = (r_dist_ticks & 0x00FF00) >> 8
        let r_ticks_1 = r_dist_ticks & 0x0000FF

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
            pins.spiWrite(SET_MOTOR_COMMAND)                               //1
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_velocity)                                     //2
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_3)                                      //3
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_2)                                      //4
            control.waitMicros(waitTime_2)
            pins.spiWrite(l_ticks_1)                                      //5
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_velocity)                                     //6
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_3)                                    //7
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_2)                                    //8
            control.waitMicros(waitTime_2)
            pins.spiWrite(r_ticks_1)                                    //9
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(SLAVESELECT_PIN, 1)
            //control.waitMicros(1000)
            readyToSend = true
        }
    }

    /**
     * Sets the finch to move in the given direction at given speed for given distance
     * @param direction Forward or Backward
     * @param speed the speed as a percent for the motor [0 to 100]
     * @param distance the discance to travel in cm
     */
    //% weight=27 blockId="setMove" block="Finch Move %direction| at %speed| \\% for %discance|cm"
    //% speed.min=0 speed.max=100
    export function setMove(direction: MoveDir, speed: number = 50, distance: number = 10): void {
        let velocity = 0
        let MINIMUM_SPEED = 0         //cm/sec
        let MAXIMUM_SPEED = 60        //cm/sec
        let tick_speed = 0
        let SPEED_CONVERSION_FACTOR = 1.379
        if (speed > MAXIMUM_SPEED) {
            speed = MAXIMUM_SPEED
        }
        if (speed < MINIMUM_SPEED) {
            speed = MINIMUM_SPEED
        }
        tick_speed = Math.round(speed * SPEED_CONVERSION_FACTOR)

        if (direction == MoveDir.Forward) {
            velocity = (0x80 | tick_speed);
        }
        else if (direction == MoveDir.Backward) {
            velocity = (0x7F & tick_speed);
        }

        sendMotor(velocity, distance, velocity, distance)
    }

    /**
     * Sets the finch to turn in the given direction at given speed for given distance
     * @param direction Right or Left
     * @param speed the speed as a percent for the motor [0 to 100]
     * @param angle the angle to turn in degrees
     */
    //% weight=26 blockId="setTurn" block="Finch Turn %direction| at %speed| \\% for %angle|°"
    //% speed.min=0 speed.max=100
    //% angle.min=0 angle.max=180
    export function setTurn(direction: RLDir, speed: number = 50, angle: number = 90): void {
        let r_speed = 0
        let l_speed = 0
        let r_dist = 0
        let l_dist = 0
        if (direction == RLDir.Right) {
            l_speed = speed
            r_speed = -speed
        } else {
            l_speed = -speed
            r_speed = speed
        }
        sendMotor(l_speed, l_dist, r_speed, r_dist)
    }

    /**
     * Starts the finch moving at given speed
     * @param speed the speed as a percent for the motor [0 to 100]
     * @param distance the discance to travel in cm
     */
    //% weight=25 blockId="startMotors" block="Finch L %l_direction| at %l_speed| \\R %r_direction| at %r_speed|"
    //% l_speed.min=0 l_speed.max=100
    //% r_speed.min=0 r_speed.max=100
    export function startMotors(l_direction: MoveDir, l_speed: number = 50, r_direction: MoveDir, r_speed: number = 50): void {
        //convert
        let l_velocity = 0
        let r_velocity = 0
        let MINIMUM_SPEED = 0         //cm/sec
        let MAXIMUM_SPEED = 60        //cm/sec
        let l_tick_speed = 0
        let r_tick_speed = 0
        let SPEED_CONVERSION_FACTOR = 1.379

        //Left Motor
        if (l_speed > MAXIMUM_SPEED) {
            l_speed = MAXIMUM_SPEED
        }
        else if (l_speed < MINIMUM_SPEED) {
            l_speed = MINIMUM_SPEED
        }
        l_tick_speed = Math.round(l_speed * SPEED_CONVERSION_FACTOR)
        if (l_direction == MoveDir.Forward) {
            l_velocity = (0x80 | l_tick_speed);
        }
        else if (l_direction == MoveDir.Backward) {
            l_velocity = (0x7F & l_tick_speed);
        }

        //Right Motor
        if (r_speed > MAXIMUM_SPEED) {
            r_speed = MAXIMUM_SPEED
        }
        else if (r_speed < MINIMUM_SPEED) {
            r_speed = MINIMUM_SPEED
        }
        r_tick_speed = Math.round(r_speed * SPEED_CONVERSION_FACTOR)
        if (r_direction == MoveDir.Forward) {
            r_velocity = (0x80 | r_tick_speed);
        }
        else if (r_direction == MoveDir.Backward) {
            r_velocity = (0x7F & r_tick_speed);
        }


        sendMotor(l_velocity, 0, r_velocity, 0)
    }

    /**
     * Stops the finch motors
     */
    //% weight=24 blockId="stopMotors" block="Finch Stop"
    export function stopMotors(): void {
        sendMotor(0, 0, 0, 0)
    }

    /**
     * Resets the finch encoders
     */
    //% weight=23 blockId="resetEncoders" block="Finch Reset Encoders"
    export function resetEncoders(): void {

    }

    /**
     * Returns the finch encoder value specified. Forward is +, Back is -
     * Returns a value in rotations.
     * @param encoder Right or Left
     */
    //% weight=22 blockId="getEncoder" block="Finch %encoder| Encoder"
    export function getEncoder(encoder: RLDir): number {
        return 0
    }

    /**
     * Reads the value of the sensors
     */
    export function getSensors(): void {
        let timeout = 0
        while (!readyToSend && timeout < 25) {
            basic.pause(10)
            timeout++;
        }
        if (readyToSend) {

            readyToSend = false
            // Need to read all sensor values and the battery to complete the communication protocol.
            control.waitMicros(waitTime_Initial)
            pins.digitalWritePin(SLAVESELECT_PIN, 0)
            control.waitMicros(waitTime_1)
            sensor_vals[0] = pins.spiWrite(0xDE) //Firmware version
            control.waitMicros(waitTime_2)
            sensor_vals[1] = pins.spiWrite(0xFF) //nothing
            control.waitMicros(waitTime_2)
            sensor_vals[2] = pins.spiWrite(0xFF) //distance msb
            control.waitMicros(waitTime_2)
            sensor_vals[3] = pins.spiWrite(0xFF) //distance lsb
            control.waitMicros(waitTime_2)
            sensor_vals[4] = pins.spiWrite(0xFF) //light left
            control.waitMicros(waitTime_2)
            sensor_vals[5] = pins.spiWrite(0xFF) //light right
            control.waitMicros(waitTime_2)
            sensor_vals[6] = pins.spiWrite(0xFF) //line left
            control.waitMicros(waitTime_2)
            sensor_vals[7] = pins.spiWrite(0xFF) //line right
            control.waitMicros(waitTime_2)
            sensor_vals[8] = pins.spiWrite(0xFF) //battery
            control.waitMicros(waitTime_2)
            sensor_vals[9] = pins.spiWrite(0xFF) //enc3 left
            control.waitMicros(waitTime_2)
            sensor_vals[10] = pins.spiWrite(0xFF) //enc2 left
            control.waitMicros(waitTime_2)
            sensor_vals[11] = pins.spiWrite(0xFF) //enc1 left
            control.waitMicros(waitTime_2)
            sensor_vals[12] = pins.spiWrite(0xFF) //enc3 right
            control.waitMicros(waitTime_2)
            sensor_vals[13] = pins.spiWrite(0xFF) //enc2 right
            control.waitMicros(waitTime_2)
            sensor_vals[14] = pins.spiWrite(0xFF) //enc1 right
            control.waitMicros(waitTime_1)
            pins.digitalWritePin(SLAVESELECT_PIN, 1)
            readyToSend = true
        }
    }

    /**
     * Returns the distance to the closest obstacle in cm
     */
    //% weight=21 blockId="getDistance" block="Finch Distance (cm)"
    export function getDistance(): number {
        getSensors()
        // Scale distance value to cm
        let return_val = ((sensor_vals[2] << 8 | sensor_vals[3]) * 117 / 100)

        return Math.round(return_val)
    }

    /**
     * Returns brightness as a value 0-100
     * @param light Right or Left
     */
    //% weight=20 blockId="getLight" block="Finch %light| Light"
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
     * Returns a value 0-100
     * @param line Right or Left
     */
    //% weight=19 blockId="getLine" block="Finch %line| Line"
    export function getLine(line: RLDir): number {
        getSensors()
        let return_val = 0
        if (line == RLDir.Right) {
            return_val = sensor_vals[7]
        } else {
            return_val = sensor_vals[6]
        }
        return_val = return_val * 100 / 255
        return Math.round(return_val)
    }

    /**
     * Reads the value of the battery in milliVolts. You may start to see
     * strange behavior when the value is below 4630 mV.
     */
    //% weight=18 blockId="getBattery" block="Finch Battery"
    export function getBattery(): number {
        getSensors()
        let return_val = 406 * (sensor_vals[8]) / 10
        return Math.round(return_val)
    }
}
