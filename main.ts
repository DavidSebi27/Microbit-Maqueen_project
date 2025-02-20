enum Mode {
    LineFollow,
    ObstacleAvoidance
}

let currentMode: Mode = Mode.LineFollow
let avoidanceTimer = 0

basic.forever(function () {
    // Read sensor values once per loop iteration
    let leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    let rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)
    let distance = maqueen.Ultrasonic()

    // Always check for obstacles if we're in line-follow mode.
    if (distance < 10 && distance > 0 && currentMode == Mode.LineFollow) {
        currentMode = Mode.ObstacleAvoidance
        avoidanceTimer = 0  // Reset the avoidance timer.
    }

    if (currentMode == Mode.ObstacleAvoidance) {
        // Increment the timer for non-blocking avoidance maneuvers.
        avoidanceTimer += 1

        if (avoidanceTimer < 5) {
            // Back up slowly.
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, 25)
        } else if (avoidanceTimer < 8) {
            // Brief stop.
            maqueen.motorStop(maqueen.Motors.All)
        } else if (avoidanceTimer < 12) {
            // Check left side: rotate left motor.
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
        } else if (avoidanceTimer < 16) {
            // Check right side: rotate right motor.
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else if (avoidanceTimer < 22) {
            // Execute a turning maneuver.
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 40)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else {
            // End of avoidance cycle; return to line-follow mode.
            currentMode = Mode.LineFollow
        }
    } else {
        // Line following mode: use your if/else–based logic.
        if (leftSensor == 0 && rightSensor == 0) {
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 50)
        } else {
            if (leftSensor == 0 && rightSensor == 1) {
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
                maqueen.motorStop(maqueen.Motors.M1)
                // If both sensors lose the line after turning...
                if (leftSensor == 1 && rightSensor == 1) {
                    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
                    maqueen.motorStop(maqueen.Motors.M1)
                }
            } else {
                if (leftSensor == 1 && rightSensor == 0) {
                    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                    maqueen.motorStop(maqueen.Motors.M2)
                    // If both sensors lose the line after turning...
                    if (leftSensor == 1 && rightSensor == 1) {
                        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                        maqueen.motorStop(maqueen.Motors.M2)
                    }
                    // If both sensors see the line again, ensure left motor runs.
                    if (leftSensor == 0 && rightSensor == 0) {
                        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                    } else {
                        maqueen.motorStop(maqueen.Motors.M2)
                    }
                }
            }
        }
    }
})
