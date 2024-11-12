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

          var startupParameters = this.getComponentData().startupParameters;
          var taskModel = startupParameters.taskModel;
          var taskId = taskModel.getData().InstanceID;
          console.log(taskId);
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
              debugger
              this.getTaskInstanceID();
              var ProcessId = this.getComponentData().startupParameters.taskModel.InstanceID;
              console.log("process Id:-", ProcessId);
              var oRootControl = this.getRootControl();
              var oTextArea = oRootControl.byId("_IDGenTextArea");

              // Initialize the flag to control whether to proceed
              let canProceed = true;

              // Validate comment field
              if (oTextArea) {
                var sCommentText = oTextArea.getValue();
                if (!sCommentText.trim()) {
                  sap.m.MessageToast.show("Comment is required to proceed.");
                  oTextArea.setValueState(sap.ui.core.ValueState.Error);
                  canProceed = false;
                } else {
                  oTextArea.setValueState(sap.ui.core.ValueState.None);
                }
              }

              // Validate payment details fields
              const requiredFields = [
                { id: "bankName-input", name: "Bank Name" },
                { id: "accNumber-input", name: "Account Number" },
                { id: "ifscCode-input", name: "IFSC Code" },
                { id: "branch-input", name: "Branch" },
                { id: "accHoldersName-input", name: "Account Holder's Name" },
                { id: "dueDate-input", name: "Due Date" }
              ];

              requiredFields.forEach(field => {
                var oField = oRootControl.byId(field.id);
                if (oField) {
                  var fieldValue = oField.getValue();
                  if (!fieldValue.trim()) {
                    sap.m.MessageToast.show(`${field.name} is required to proceed.`);
                    oField.setValueState(sap.ui.core.ValueState.Error);
                    canProceed = false;
                  } else {
                    oField.setValueState(sap.ui.core.ValueState.None);
                  }
                }
              });

              // Validate delivery details fields and update them one by one
              var oTable = oRootControl.byId("delivery-details-table");
              if (oTable) {
                var oModel = oTable.getModel("myModel");
                var oData = oRootControl.getModel("context").getData();
                var baseUrl = JSON.parse(oData.link);
                var purchaseOrderId = baseUrl[0].purchaseOrderUuid.replace(/['"]/g, '');
                var sPath = "/Files";
                var oDeliveryData = oModel.getProperty(sPath);

                oDeliveryData.forEach(function (oDeliveryRow, index) {
                  var rowPath = sPath + "/" + index;
                  var isRowValid = true;

                  if (!oDeliveryRow.vehicleID) {
                    sap.m.MessageToast.show(`Vehicle ID is required for row ${index + 1}.`);
                    isRowValid = false;
                  }
                  if (!oDeliveryRow.deliveryDate) {
                    sap.m.MessageToast.show(`Delivery Date is required for row ${index + 1}.`);
                    isRowValid = false;
                  }
                  if (oDeliveryRow.shippingCharges === undefined || oDeliveryRow.shippingCharges === null || oDeliveryRow.shippingCharges.trim() === "") {
                    sap.m.MessageToast.show(`Shipping Charges are required for row ${index + 1}.`);
                    isRowValid = false;
                  }

                  if (!isRowValid) {
                    canProceed = false;
                  } else {
                    // Send individual AJAX request for each row
                    const baseUrlDelivery = 'https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/';
                    var deliveryUrl = `${baseUrlDelivery}PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToVehicle(vehicleID=${oDeliveryRow.vehicleID},IsActiveEntity=true)`;

                    $.ajax({
                      url: deliveryUrl,
                      method: "PATCH",
                      contentType: "application/json",
                      data: JSON.stringify({
                        deliveryDate: oDeliveryRow.deliveryDate,
                        shippingCharges: oDeliveryRow.shippingCharges
                      }),
                      success: function (oData) {
                        console.log(`Delivery details updated for vehicle ID: ${oDeliveryRow.vehicleID}`, oData);
                      },
                      error: function (jqXHR, textStatus, errorThrown) {
                        console.error(`Error updating delivery details for vehicle ID: ${oDeliveryRow.vehicleID}`, textStatus, errorThrown);
                      }
                    });
                  }
                });
              }

              // Proceed only if all validations are passed
              if (canProceed) {
                this.completeTask(true, approveOutcomeId);

                // Post Comment
                var oData = oRootControl.getModel("context").getData();
                var baseUrl = JSON.parse(oData.link);
                var purchaseOrderId = baseUrl[0].purchaseOrderUuid.replace(/['"]/g, '');
                const baseUrlComments = 'https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/';
                var url = `${baseUrlComments}PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToComments`;

                $.ajax({
                  url: url,
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify({
                    purchaseOrderUuid: purchaseOrderId,
                    commentsText: sCommentText,
                    IsActiveEntity: true,
                  }),
                  success: function (oData) {
                    console.log("Comment Posted", oData);
                    var oCommentModel = oRootControl.getModel("commentModel");
                    if (!oCommentModel) {
                      oCommentModel = new sap.ui.model.json.JSONModel();
                      oRootControl.setModel(oCommentModel, "myComments");
                    }
                    oCommentModel.setProperty("/Comments", sCommentText);
                  },
                  error: function (jqXHR, textStatus, errorThrown) {
                    console.error("Error posting comment: " + textStatus + ' ' + errorThrown);
                  }
                });

                // Update Form Data
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

                  const baseUrlForm = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
                  var formUrl = `PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)`;

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
          console.log(this.getModel("task").getData().InstanceID);
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
