enum Mode {
    LineFollow,
    ObstacleAvoidance
}

let currentMode: Mode = Mode.LineFollow
let avoidanceTimer = 0

basic.forever(function () {
    // Read sensors
    let leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    let rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)
    let distance = maqueen.Ultrasonic()

    // Always check for obstacles (if not already avoiding)
    if (distance < 10 && distance > 0 && currentMode == Mode.LineFollow) {
        currentMode = Mode.ObstacleAvoidance
        avoidanceTimer = 0  // reset the avoidance timer
    }

    if (currentMode == Mode.ObstacleAvoidance) {
        // Increment timer so we can perform non-blocking avoidance steps.
        avoidanceTimer += 1

        if (avoidanceTimer < 5) {
            // Back up slowly
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, 25)
        } else if (avoidanceTimer < 8) {
            // Brief stop
            maqueen.motorStop(maqueen.Motors.All)
        } else if (avoidanceTimer < 12) {
            // Check left side (rotate left motor)
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
        } else if (avoidanceTimer < 16) {
            // Check right side (rotate right motor)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else if (avoidanceTimer < 22) {
            // Execute a turning maneuver
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 40)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else {
            // After the avoidance cycle, return to line following mode.
            currentMode = Mode.LineFollow
        }
    } else {
        // In LineFollow mode, use proportional control for smoother corrections.
        // Here, we assume:
        //   - Sensor value 0: line detected (black)
        //   - Sensor value 1: line lost (white)
        // Compute error as (rightSensor - leftSensor). For example:
        //   - If left=0 and right=1, error = 1, meaning the line is under the left sensor.
        //     Correction: slow the left motor, speed up the right motor to turn left.
        let baseSpeed = 50
        let Kp = 10  // Proportional constant; adjust this to tune responsiveness.
        let error = rightSensor - leftSensor
        let correction = error * Kp
        let leftSpeed = baseSpeed - correction
        let rightSpeed = baseSpeed + correction

        // Optionally clamp speeds to allowed limits.
        if (leftSpeed < 0) leftSpeed = 0
        if (rightSpeed < 0) rightSpeed = 0
        if (leftSpeed > 100) leftSpeed = 100
        if (rightSpeed > 100) rightSpeed = 100

        // Run the motors with corrected speeds.
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, leftSpeed)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, rightSpeed)
    }
})
