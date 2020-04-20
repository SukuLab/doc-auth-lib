var Docauth = artifacts.require('Docauth');

module.exports = function(deployer) {
	// deployment steps
	deployer.deploy(Docauth);
};
