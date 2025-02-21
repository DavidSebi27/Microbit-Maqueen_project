enum Mode {
    LineFollow,
    ObstacleAvoidance
}

let currentMode: Mode = Mode.LineFollow
let avoidanceTimer = 0

basic.forever(function () {
    let distance = maqueen.Ultrasonic()

    // Check for obstacles when in line-follow mode.
    if (distance < 10 && distance > 0 && currentMode === Mode.LineFollow) {
        currentMode = Mode.ObstacleAvoidance
        avoidanceTimer = 0
    }

    if (currentMode === Mode.ObstacleAvoidance) {
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
        // Line following mode using inline sensor readings.
        if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 0 &&
            maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 0) {
            // Both sensors on line: drive forward.
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 50)
        } else if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 0 &&
            maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 1) {
            // Left sensor on line, right sensor off line: slow left wheel.
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 15)
            // If both sensors lose the line, repeat turning command.
            if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 1 &&
                maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 1) {
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 15)
            }
        } else if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 1 &&
            maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 0) {
            // Right sensor on line, left sensor off line: slow right wheel.
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 15)
            if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 1 &&
                maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 1) {
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 15)
            }
            if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) === 0 &&
                maqueen.readPatrol(maqueen.Patrol.PatrolRight) === 0) {
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
            } else {
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 15)
            }
        }
    }
})
