const { COSTS } = require("../data/costs");
const { projectPage } = require("./project-template");
module.exports = COSTS.map(projectPage);
