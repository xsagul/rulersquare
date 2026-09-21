const { TOOLS } = require("../data/tools");
const { projectPage } = require("./project-template");
module.exports = TOOLS.map(projectPage);
