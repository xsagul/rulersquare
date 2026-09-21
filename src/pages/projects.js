const { PROJ } = require("../data/projects");
const { projectPage } = require("./project-template");
module.exports = PROJ.map(projectPage);
