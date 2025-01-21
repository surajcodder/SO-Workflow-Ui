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
              debugger
              // console.log("process Id:-", ProcessId);
              var oRootControl = this.getRootControl();
              var oTextArea = oRootControl.byId("_IDGenTextArea");

              // Initialize the flag to control whether to proceed
              let canProceed = true;
              // Validate comment field
              if (oTextArea) {
                var sCommentText = oTextArea.getValue();
                console.log(sCommentText);
                if (!sCommentText.trim()) {
                  sap.m.MessageToast.show("Comment is required to proceed.");
                  oTextArea.setValueState(sap.ui.core.ValueState.Error);
                  canProceed = false;
                } else {
                  oTextArea.setValueState(sap.ui.core.ValueState.None);
                }
              }

              // var oTable = oRootControl.byId("delivery-details-table");

              // if (oTable) {
              //   var oModel = oTable.getModel("myModel");
              //   var oData = oRootControl.getModel("context").getData();
              //   var baseUrl = JSON.parse(oData.link);
              //   var purchaseOrderId = baseUrl[0].purchaseOrderUuid.replace(/['"]/g, '');
              //   var sPath = "/Files";
              //   var oDeliveryData = oModel.getProperty(sPath);

                
              //   oDeliveryData.forEach(function (oDeliveryRow, index) {
              //     var rowPath = sPath + "/" + index;
              //     oDeliveryRow = oModel.getProperty(rowPath); // Refresh row data
              
              //     console.log(`Row ${index + 1} - Vehicle ID:`, oDeliveryRow.vehicleID);
              //     console.log(`Row ${index + 1} - Delivery Date:`, oDeliveryRow.delDate);
              //     console.log(`Row ${index + 1} - Delivery Lead Time:`, oDeliveryRow.deliveryLeadTime);
              //     console.log(`Row ${index + 1} - Transport Mode:`, oDeliveryRow.shippingMethod);
              
              //     var isRowValid = true;
              
              //     // Validation
              //     if (!oDeliveryRow.vehicleID) {
              //         sap.m.MessageToast.show(`Row ${index + 1}: Vehicle ID is required.`);
              //         isRowValid = false;
              //     }
              //     if (!oDeliveryRow.delDate) {
              //         sap.m.MessageToast.show(`Row ${index + 1}: Delivery Date is required.`);
              //         isRowValid = false;
              //     }
              
              //     // If any of the fields are missing, prevent proceeding
              //     if (!isRowValid) {
              //         canProceed = false; // Set canProceed to false if validation fails
              //     }
              
              //     if (isRowValid) {
              //         try {
              //             // Format delivery date explicitly in local time zone
              //             var deliveryDate = new Date(oDeliveryRow.delDate);
              //             if (isNaN(deliveryDate)) {
              //                 throw new Error(`Row ${index + 1}: Invalid date format.`);
              //             }
              
              //             // Ensure date is interpreted in local time
              //             var formattedDate = [
              //                 deliveryDate.getFullYear(),
              //                 String(deliveryDate.getMonth() + 1).padStart(2, '0'),
              //                 String(deliveryDate.getDate()).padStart(2, '0')
              //             ].join('-'); // YYYY-MM-DD
              
              //             // Construct PATCH URL
              //             const baseUrlDelivery = 'https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/';
              //             var deliveryUrl = `${baseUrlDelivery}PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToVehicle(vehicleID=${oDeliveryRow.vehicleID},IsActiveEntity=true)`;
              
              //             // Log the payload being sent
              //             console.log(`Row ${index + 1}: Sending PATCH request with data:`, {
              //                 delDate: formattedDate,
              //                 deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
              //                 transportMode: oDeliveryRow.transportMode
              //             });
                          
              
              //             // Send PATCH request
              //             $.ajax({
              //                 url: deliveryUrl,
              //                 method: "PATCH",
              //                 contentType: "application/json",
              //                 data: JSON.stringify({
              //                     delDate: formattedDate,
              //                     deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
              //                     transportMode: oDeliveryRow.transportMode
              //                 }),
              //                 success: function (oData) {
              //                     console.log(`Row ${index + 1}: Success - Delivery details updated`, oData);
              //                     // sap.m.MessageToast.show(`Row ${index + 1}: Delivery details updated successfully.`);
              //                 },
              //                 error: function (jqXHR, textStatus, errorThrown) {
              //                     console.error(`Row ${index + 1}: Error updating details`, textStatus, errorThrown);
              //                     // sap.m.MessageToast.show(`Row ${index + 1}: Update failed. Check console for details.`);
              //                 }
              //             });
              
              //         } catch (error) {
              //             console.error(error.message);
              //             sap.m.MessageToast.show(error.message);
              //         }
                  // }
              // });              
              // }

              // Proceed only if all validations are passed
              if (canProceed) {
                this.completeTask(true, approveOutcomeId);

                // Post Comment
                var oData = oRootControl.getModel("context").getData();
                var baseUrl = JSON.parse(oData.link);
                var purchaseOrderId = baseUrl[0].purchaseOrderUuid.replace(/['"]/g, '');
                const baseUrlComments = 'https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/';
                var url = `${baseUrlComments}PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToComments`;

                $.ajax({
                  url: url,
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify({
                    purchaseOrderUuid: purchaseOrderId,
                    commentsText: sCommentText,
                    user: 'M',
                    IsActiveEntity: true
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
              //   var oForm = oRootControl.byId("payment-details-form");
              //   if (oForm) {
              //     var oFormData = {};
              //     var aFormContent = oForm.getContent();
              //     aFormContent.forEach(function (oControl) {
              //       if (oControl instanceof sap.m.DatePicker) { // Capture only the DatePicker
              //         var sControlId = oControl.getId();
              //         if (sControlId === oRootControl.byId("dueDate-input").getId()) {
              //           oFormData.dueDate = oControl.getValue(); // Update only dueDate
              //         }
              //       }
              //     });

              //     const baseUrlForm = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
              //     var formUrl = `PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)`;

              //     // Perform the PATCH request with only the dueDate field
              //     $.ajax({
              //       url: baseUrlForm + formUrl,
              //       method: "PATCH",
              //       contentType: "application/json",
              //       data: JSON.stringify(oFormData), // Contains only dueDate
              //       success: function (oData) {
              //         console.log("Due Date Updated:", oData);
              //       },
              //       error: function (jqXHR, textStatus, errorThrown) {
              //         console.error("Error updating due date: " + textStatus + ' ' + errorThrown);
              //       }
              //     });
              //   }
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
// oDeliveryData.forEach(function (oDeliveryRow, index) {
                //   var rowPath = sPath + "/" + index;
                //   oDeliveryRow = oModel.getProperty(rowPath); // Refresh row data

                //   console.log(`Row ${index + 1} - Vehicle ID:`, oDeliveryRow.vehicleID);
                //   console.log(`Row ${index + 1} - Delivery Date:`, oDeliveryRow.delDate);
                //   console.log(`Row ${index + 1} - Delivery Lead Time:`, oDeliveryRow.deliveryLeadTime);
                //   console.log(`Row ${index + 1} - Transport Mode:`, oDeliveryRow.shippingMethod);

                //   var isRowValid = true;

                //   // Validation
                //   if (!oDeliveryRow.vehicleID) {
                //     sap.m.MessageToast.show(`Row ${index + 1}: Vehicle ID is required.`);
                //     isRowValid = false;
                //   }
                //   if (!oDeliveryRow.delDate) {
                //     sap.m.MessageToast.show(`Row ${index + 1}: Delivery Date is required.`);
                //     isRowValid = false;
                //   }

                //   // If any of the fields are missing, prevent proceeding
                //   if (!isRowValid) {
                //     canProceed = false; // Set canProceed to false if validation fails
                //   }

                //   if (isRowValid) {
                //     try {
                //       // Format delivery date
                //       var deliveryDate = new Date(oDeliveryRow.delDate);
                //       if (isNaN(deliveryDate)) {
                //         throw new Error(`Row ${index + 1}: Invalid date format.`);
                //       }
                //       var formattedDate = deliveryDate.toISOString().split('T')[0]; // YYYY-MM-DD

                //       // Construct PATCH URL
                //       const baseUrlDelivery = 'https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/';
                //       var deliveryUrl = `${baseUrlDelivery}PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToVehicle(vehicleID=${oDeliveryRow.vehicleID},IsActiveEntity=true)`;

                //       // Log the payload being sent
                //       console.log(`Row ${index + 1}: Sending PATCH request with data:`, {
                //         delDate: formattedDate,
                //         deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
                //         transportMode: oDeliveryRow.transportMode
                //       });

                //       // Send PATCH request
                //       $.ajax({
                //         url: deliveryUrl,
                //         method: "PATCH",
                //         contentType: "application/json",
                //         data: JSON.stringify({
                //           delDate: formattedDate,
                //           deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
                //           transportMode: oDeliveryRow.transportMode
                //         }),
                //         success: function (oData) {
                //           console.log(`Row ${index + 1}: Success - Delivery details updated`, oData);
                //           sap.m.MessageToast.show(`Row ${index + 1}: Delivery details updated successfully.`);
                //         },
                //         error: function (jqXHR, textStatus, errorThrown) {
                //           console.error(`Row ${index + 1}: Error updating details`, textStatus, errorThrown);
                //           sap.m.MessageToast.show(`Row ${index + 1}: Update failed. Check console for details.`);
                //         }
                //       });

                //     } catch (error) {
                //       console.error(error.message);
                //       sap.m.MessageToast.show(error.message);
                //     }
                //   }
                // });