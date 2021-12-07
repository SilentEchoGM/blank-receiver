"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.miscEvents = exports.Team = exports.gameStates = exports.sosStatFeedEvents = exports.sosEvents = void 0;
exports.sosEvents = [
    "game:update_state",
    "game:initialized",
    "game:pre_countdown_begin",
    "game:post_countdown_begin",
    "game:round_started_go",
    "game:clock_started",
    "game:ball_hit",
    "game:clock_updated_seconds",
    "game:statfeed_event",
    "game:clock_stopped",
    "game:goal_scored",
    "game:replay_start",
    "game:replay_end",
    "game:replay_will_end",
    "game:match_ended",
    "game:podium_start",
    "game:match_destroyed",
    "game:match_created",
    "sos:version",
];
exports.sosStatFeedEvents = [
    "Demolition",
    "Shot on Goal",
    "Goal",
    "Assist",
    "Save",
    "Win",
    "MVP",
];
exports.gameStates = [
    "Default",
    "Created",
    "Ready",
    "Countdown",
    "Kickoff",
    "Active",
    "GoalScored",
    "Replay",
    "Ended",
    "Podium",
    "Scoreboard",
    "Menu",
];
var Team;
(function (Team) {
    Team[Team["blue"] = 0] = "blue";
    Team[Team["orange"] = 1] = "orange";
})(Team = exports.Team || (exports.Team = {}));
exports.miscEvents = [
    "game:initialized",
    "game:pre_countdown_begin",
    "game:post_countdown_begin",
    "game:clock_started",
    "game:clock_updated_seconds",
    "game:clock_stopped",
    "game:replay_end",
    "game:replay_will_end",
    "game:podium_start",
    "game:match_destroyed",
    "game:match_created",
];
