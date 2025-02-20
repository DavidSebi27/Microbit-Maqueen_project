basic.forever(function () {
    // First, check for obstacles
    let distance = maqueen.Ultrasonic()
    if (distance < 10 && distance > 0) {
        // Obstacle avoidance routine
        maqueen.motorStop(maqueen.Motors.All)
        basic.pause(150) // slightly shorter pause

        // Check left side
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
        basic.pause(250)
        let leftCheck = maqueen.Ultrasonic()

        // Check right side
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
        basic.pause(250)
        let rightCheck = maqueen.Ultrasonic()

        maqueen.motorStop(maqueen.Motors.All)
        basic.pause(150)

        // Decide escape route
        if (leftCheck > 10) {
            // Turn left: left motor reverse, right motor forward
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 40)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 40)
            basic.pause(500)
        } else if (rightCheck > 10) {
            // Turn right: left motor forward, right motor reverse
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 40)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, 40)
            basic.pause(500)
        } else {
            // No clear path: back up
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, 25)
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, 25)
            basic.pause(500)
        }
        // Return early so that line following does not run during obstacle avoidance
        return;
    }

    // Now, execute line follower logic.
    // Read both line sensors once for consistency.
    let leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft)
    let rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight)

    // If both sensors detect the line (0 means on the line for many setups)
    if (leftSensor == 0 && rightSensor == 0) {
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 50)
    } else if (leftSensor == 0 && rightSensor == 1) {
        // Turn slightly left: slow/stop left motor, run right motor
        maqueen.motorStop(maqueen.Motors.M1)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, 50)
    } else if (leftSensor == 1 && rightSensor == 0) {
        // Turn slightly right: run left motor, slow/stop right motor
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, 50)
        maqueen.motorStop(maqueen.Motors.M2)
    } else {
        // If both sensors lose the line, try moving forward slowly
        maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, 50)
    }
})
