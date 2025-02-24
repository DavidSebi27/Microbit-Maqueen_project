enum Mode {
    LineFollow,
    ObstacleAvoidance
}

let currentMode: Mode = Mode.LineFollow;

// Motor Speed Settings
let baseSpeed = 25;  // Base speed for straight sections
let outerWheelSpeed = 25;  // Outer wheel speed during turns
let innerWheelSpeed = 10;  // Inner wheel speed during turns (backward)

// Ultrasonic Sensor Thresholds
let obstacleThreshold = 10;  // Distance (in cm) to detect an obstacle
let safeDistance = 15;       // Distance (in cm) to consider the obstacle cleared

// Last Turn Direction
let lastTurn = "none";

basic.forever(function () {
    let distance = maqueen.Ultrasonic();

    // Check for obstacles while in line-follow mode.
    if (distance < obstacleThreshold && distance > 0 && currentMode === Mode.LineFollow) {
        currentMode = Mode.ObstacleAvoidance;
    }

    if (currentMode === Mode.ObstacleAvoidance) {
        // Obstacle avoidance logic
        if (distance < obstacleThreshold && distance > 0) {
            // Obstacle detected: turn left to go around it.
            // Outer wheel (M2) forward at 25, inner wheel (M1) backward at 10.
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, outerWheelSpeed);
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, innerWheelSpeed);
        } else {
            // No obstacle detected: move forward to clear the obstacle.
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, baseSpeed);

            // Check if the obstacle is fully cleared.
            if (distance >= safeDistance) {
                // Resume line-following mode.
                currentMode = Mode.LineFollow;
            }
        }
    } else {
        // Line-following mode using inline sensor readings.
        let leftSensor = maqueen.readPatrol(maqueen.Patrol.PatrolLeft);
        let rightSensor = maqueen.readPatrol(maqueen.Patrol.PatrolRight);

        // Line-following logic
        if (leftSensor === 0 && rightSensor === 0) {
            // Both sensors on the line: drive straight.
            maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, baseSpeed);
        } else if (leftSensor === 0 && rightSensor === 1) {
            // Left sensor on line, right sensor off: turn left.
            // Outer wheel (M2) forward at 25, inner wheel (M1) backward at 10.
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, outerWheelSpeed);
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, innerWheelSpeed);
            lastTurn = "left";  // Update last turn direction
        } else if (leftSensor === 1 && rightSensor === 0) {
            // Right sensor on line, left sensor off: turn right.
            // Outer wheel (M1) forward at 25, inner wheel (M2) backward at 10.
            maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, outerWheelSpeed);
            maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, innerWheelSpeed);
            lastTurn = "right";  // Update last turn direction
        } else {
            // Both sensors on the surface (white) - recover based on last turn.
            if (lastTurn === "left") {
                // Recover left: turn left.
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, outerWheelSpeed);
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, innerWheelSpeed);
            } else if (lastTurn === "right") {
                // Recover right: turn right.
                maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, outerWheelSpeed);
                maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, innerWheelSpeed);
            } else {
                // If no last turn, move forward slowly.
                maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, baseSpeed);
            }
        }
    }

    // Small Delay for Stability
    basic.pause(10);
});