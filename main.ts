enum Mode {
    LineFollow,
    ObstacleAvoidance
}

let currentMode: Mode = Mode.LineFollow
let avoidanceTimer = 0

basic.forever(function () {
    // Continuously check the line sensors
    let leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    let rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)

    // Always check for obstacles even during line following
    let distance = maqueen.Ultrasonic()

    // If an obstacle is detected and we're not already avoiding it, switch modes.
    if (distance < 10 && distance > 0 && currentMode == Mode.LineFollow) {
        currentMode = Mode.ObstacleAvoidance
        avoidanceTimer = 0  // reset a timer for avoidance steps
    }

    if (currentMode == Mode.ObstacleAvoidance) {
        // Instead of long blocking pauses, use a timer to perform steps in small intervals.
        avoidanceTimer += 1

        // Example steps: for the first few cycles, back up; then check sides; then turn.
        if (avoidanceTimer < 5) {
            // Back up slowly
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CCW, 25)
        } else if (avoidanceTimer < 8) {
            // Briefly stop
            maqueen.motorStop(maqueen.Motors.All)
        } else if (avoidanceTimer < 12) {
            // Check left side
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
            // You could read sensor here if needed
        } else if (avoidanceTimer < 16) {
            // Check right side (or perform turning based on previous check)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else if (avoidanceTimer < 22) {
            // Example: perform a turning maneuver.
            // (In a more advanced version, store left/right checks and decide based on them.)
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 40)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        } else {
            // After a full cycle of avoidance, return to line following mode.
            currentMode = Mode.LineFollow
        }
    } else {
        // Line following mode (slow speed for better responsiveness)
        if (leftSensor == 0 && rightSensor == 0) {
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 50)
        } else {
            if (leftSensor == 0 && rightSensor == 1) {
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
                maqueen.motorStop(maqueen.Motors.M1)
                if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
                    maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
                    maqueen.motorStop(maqueen.Motors.M1)
                }
            } else {
                if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
                    maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                    maqueen.motorStop(maqueen.Motors.M2)
                    if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 1 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 1) {
                        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                        maqueen.motorStop(maqueen.Motors.M2)
                    }
                    if (maqueen.readPatrol(maqueen.Patrol.PatrolLeft) == 0 && maqueen.readPatrol(maqueen.Patrol.PatrolRight) == 0) {
                        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
                    } else {
                        maqueen.motorStop(maqueen.Motors.M2)
                    }
                }
            }
        }
    }
})
