/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"FinanceWorkflow/workflow-ui-Finance/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
