sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "FinanceWorkflow/workflowuiFinance/model/models",
  ],
  function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend(
      "FinanceWorkflow.workflowuiFinance.Component",
      {
        metadata: {
          manifest: "json",
        },

        /**
         * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
         * @public
         * @override
         */
        init: function () {

          // call the base component's init function
          UIComponent.prototype.init.apply(this, arguments);

          // enable routing
          this.getRouter().initialize();

          // set the device model
          this.setModel(models.createDeviceModel(), "device");

          this.setTaskModels();

          const rejectOutcomeId = "reject";
          // this.getInboxAPI().addAction(
          //     {
          //     action: rejectOutcomeId,
          //     label: "Reject",
          //     type: "reject",
          //     },
          //     function () {
          //     this.completeTask(false, rejectOutcomeId);
          //     },
          //     this
          // );
          const approveOutcomeId = "approve";
          this.getInboxAPI().addAction(
            {
              action: approveOutcomeId,
              label: "Release SO",
              type: "accept",
            },
            function () {
              this.completeTask(true, approveOutcomeId);
              debugger;

              var oRootControl = this.getRootControl();

              // ----- Part 1: Post Comment -----
              var oTextArea = oRootControl.byId("_IDGenTextArea");
              if (oTextArea) {
                var sCommentText = oTextArea.getValue();
                var oData = oRootControl.getModel("context").getData();
                var baseUrl = JSON.parse(oData.link);
                var soID = baseUrl[0].soID;
                var baseUrlComments = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
                var commentUrl = "Comment";

                $.ajax({
                  url: baseUrlComments + commentUrl,
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify({
                    soID: soID,
                    commentsText: sCommentText,
                    IsActiveEntity: true,
                  }),
                  success: function (oData) {
                    console.log("Comment Posted", oData);
                    var oCommentModel = oRootControl.getModel("commentModel");
                    if (!oCommentModel) {
                      oCommentModel = new sap.ui.model.json.JSONModel();
                      oRootControl.setModel(oCommentModel, "commentModel");
                    }
                    oCommentModel.setProperty("/Comment", sCommentText);
                  },
                  error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error posting comment: " + textStatus + ' ' + errorThrown);
                  }
                });
              }

              // ----- Part 2: Update Delivery Details -----
              var oTable = oRootControl.byId("delivery-details-table");
              if (oTable) {
                var oModel = oTable.getModel("myModel");
                var sPath = "/Files";
                var oDeliveryData = oModel.getProperty(sPath);

                oDeliveryData.forEach(function (oDeliveryRow) {
                  var deliveryData = {
                    vehicleID: oDeliveryRow.vehicleID,
                    vehicleCode: oDeliveryRow.vehicleCode,
                    deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
                    deliveryDate: oDeliveryRow.deliveryDate,
                    shippingMethod: oDeliveryRow.shippingMethod,
                    shippingCharges: oDeliveryRow.shippingCharges
                  };

                  var baseUrlDelivery = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
                  const deliveryUrl = `SalesVehicle(vehicleID=${oDeliveryRow.vehicleID})`;

                  $.ajax({
                    url: baseUrlDelivery + deliveryUrl,
                    method: "PATCH",
                    contentType: "application/json",
                    data: JSON.stringify(deliveryData),
                    success: function (oData) {
                      console.log("Delivery Details Updated for vehicle ID:", oDeliveryRow.vehicleID, oData);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                      console.error("Error updating delivery details for vehicle ID " + oDeliveryRow.vehicleID + ": " + textStatus + ' ' + errorThrown);
                    }
                  });
                });
              }

              // ----- Part 3: Live Update of Form Data -----
              var oForm = oRootControl.byId("payment-details-form");
              if (oForm) {
                var oFormData = {};
                var aFormContent = oForm.getContent();

                aFormContent.forEach(function (oControl) {
                  if (oControl instanceof sap.m.Input) {
                    var sControlId = oControl.getId();

                    switch (sControlId) {
                      case oRootControl.byId("bankName-input").getId():
                        oFormData.bankName = oControl.getValue();
                        break;
                      case oRootControl.byId("accNumber-input").getId():
                        oFormData.accNumber = oControl.getValue();
                        break;
                      case oRootControl.byId("ifscCode-input").getId():
                        oFormData.ifscCode = oControl.getValue();
                        break;
                      case oRootControl.byId("branch-input").getId():
                        oFormData.branch = oControl.getValue();
                        break;
                      case oRootControl.byId("accHoldersName-input").getId():
                        oFormData.accHoldersName = oControl.getValue();
                        break;
                      case oRootControl.byId("dueDate-input").getId():
                        oFormData.dueDate = oControl.getValue();
                        break;
                    }
                  }
                });

                // Log form data to ensure it's gathered correctly
                console.log("Form Data:", oFormData);

                // Perform an AJAX call to send form data to the backend
                var baseUrlForm = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
                var formUrl = `SalesOrder(soID='${soID}',IsActiveEntity=true)`; 

                $.ajax({
                  url: baseUrlForm + formUrl,
                  method: "PATCH",
                  contentType: "application/json",
                  data: JSON.stringify(oFormData),
                  success: function (oData) {
                    console.log("Form Data Updated:", oData);
                  },
                  error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error updating form data: " + textStatus + ' ' + errorThrown);
                  }
                });
              }
            },
            this
          );
        },

        setTaskModels: function () {
          // set the task model
          var startupParameters = this.getComponentData().startupParameters;
          this.setModel(startupParameters.taskModel, "task");

          // set the task context model
          var taskContextModel = new sap.ui.model.json.JSONModel(
            this._getTaskInstancesBaseURL() + "/context"
          );
          this.setModel(taskContextModel, "context");
        },

        _getTaskInstancesBaseURL: function () {
          return (
            this._getWorkflowRuntimeBaseURL() +
            "/task-instances/" +
            this.getTaskInstanceID()
          );
        },

        _getWorkflowRuntimeBaseURL: function () {
          var ui5CloudService = this.getManifestEntry("/sap.cloud/service").replaceAll(".", "");
          var ui5ApplicationName = this.getManifestEntry("/sap.app/id").replaceAll(".", "");
          var appPath = `${ui5CloudService}.${ui5ApplicationName}`;
          return `/${appPath}/api/public/workflow/rest/v1`

        },

        getTaskInstanceID: function () {
          return this.getModel("task").getData().InstanceID;
        },

        getInboxAPI: function () {
          var startupParameters = this.getComponentData().startupParameters;
          return startupParameters.inboxAPI;
        },

        completeTask: function (approvalStatus, outcomeId) {
          this.getModel("context").setProperty("/approved", approvalStatus);
          this._patchTaskInstance(outcomeId);
        },

        _patchTaskInstance: function (outcomeId) {
          const context = this.getModel("context").getData();
          var data = {
            status: "COMPLETED",
            context: { ...context, comment: context.comment || '' },
            decision: outcomeId
          };

          jQuery.ajax({
            url: `${this._getTaskInstancesBaseURL()}`,
            method: "PATCH",
            contentType: "application/json",
            async: true,
            data: JSON.stringify(data),
            headers: {
              "X-CSRF-Token": this._fetchToken(),
            },
          }).done(() => {
            this._refreshTaskList();
          })
        },

        _fetchToken: function () {
          var fetchedToken;

          jQuery.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },

        _refreshTaskList: function () {
          this.getInboxAPI().updateTask("NA", this.getTaskInstanceID());
        },
      }
    );
  }
);
