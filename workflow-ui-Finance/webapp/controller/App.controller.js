sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend(
    "FinanceWorkflow.workflowuiFinance.controller.App",
    {
      onInit: function () {
        debugger
      },
      // Handle scrolling behavior
      onScroll: function (oEvent) {
        var scrollTop = oEvent.target.scrollTop;

        // Get the offset positions of sections
        var generalInfoSectionTop = this.byId(
          "generalInformationSection"
        ).getDomRef().offsetTop;
        var vehicleDetailsSectionTop = this.byId(
          "vehicleDetailsSection"
        ).getDomRef().offsetTop;
        var attachmentsSectionTop =
          this.byId("attachmentsSection").getDomRef().offsetTop;

        // Clear active buttons
        this._clearActiveButton();

        // Determine which button to highlight based on scroll position
        if (
          scrollTop >= generalInfoSectionTop &&
          scrollTop < vehicleDetailsSectionTop
        ) {
          this._setActiveButton("navGeneralInfo");
        } else if (
          scrollTop >= vehicleDetailsSectionTop &&
          scrollTop < attachmentsSectionTop
        ) {
          this._setActiveButton("navVehicleDetails");
        } else if (scrollTop >= attachmentsSectionTop) {
          this._setActiveButton("navAttachments");
        }
      },

      _clearActiveButton: function () {
        var buttons = ["navGeneralInfo", "navVehicleDetails", "navAttachments"];
        buttons.forEach(
          function (buttonId) {
            this.byId(buttonId).removeStyleClass("activeButton");
          }.bind(this)
        );
      },

      _setActiveButton: function (buttonId) {
        this.byId(buttonId).addStyleClass("activeButton");
      },

      onNavToGeneralInfo: function () {
        this._scrollToSection("generalInformationSection");
      },

      onNavToVehicleDetails: function () {
        this._scrollToSection("vehicleDetailsSection");
      },

      onNavToAttachments: function () {
        this._scrollToSection("attachmentsSection");
      },

      _scrollToSection: function (sectionId) {
        var section = this.byId(sectionId).getDomRef();
        var container = this._scrollContainer.getDomRef();
        if (section && container) {
          container.scrollTo({ top: section.offsetTop, behavior: "smooth" });
        }
      },

      // AJAX Call for OData before rendering
      onBeforeRendering: function () {
        setTimeout(
          function () {
            var oView = this.getView();
            debugger
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var baseUrl = JSON.parse(oData.link);
            console.log(oData.link)
            debugger
            // Perform AJAX request to retrieve data
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ Files: baseUrl });
            oView.setModel(oModel, "myModel");
            var aData = oModel.getData("Files"); // Get the data array from your model
            // var iRowCount = aData ? aData.length : 0; // Determine the row count based on the data length

            // var oVehicleTable = this.byId("vehicle-details-table");
            // var oDeliveryTable = this.byId("delivery-details-table");

            // oVehicleTable.setVisibleRowCount(iRowCount); // Set the row count based on data length
            // oDeliveryTable.setVisibleRowCount(iRowCount); // Same for delivery details
            // error: function (jqXHR, textStatus, errorThrown) {
            //   console.error(
            //     "Error fetching data: " + textStatus + " " + errorThrown
            //   );
            // },
          }.bind(this),
          1000
        );

        // New AJAX call to fetch comment history data
        setTimeout(
          function () {
            var oView1 = this.getView();
            var baseUrl1 =
              "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/Comment";

            // Perform AJAX request to retrieve comment data
            $.ajax({
              url: baseUrl1,
              method: "GET",
              success: function (oData) {
                console.log(oData);
                var oModel1 = new sap.ui.model.json.JSONModel();
                oModel1.setData({ Comments: oData.value });
                oView1.setModel(oModel1, "myComments");
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                  "Error fetching comment data: " +
                  textStatus +
                  " " +
                  errorThrown
                );
              },
            });
          }.bind(this),
          1000
        );
        setTimeout(
          function () {
            var oView = this.getView();
            debugger
            // var oData1 = oView.oPropagatedProperties.oModels.context.oData;
            var baseUrl2 = "https://dde7cfc6trial-dev-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/Files";
            // Perform AJAX request to retrieve data
            $.ajax({
              url: baseUrl2,
              method: "GET",
              success: function (oData) {
                console.log("Files", oData);
                var oModel = new JSONModel();
                oModel.setData({ pdf: oData.value });
                debugger
                oView.setModel(oModel, "myFile");

              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: " + textStatus + ' ' + errorThrown);
              }
            });
          }.bind(this),
          1000
        );
      },
      onOpenPressed: function (oEvent) {
        debugger
        var baseUrl = "https://dde7cfc6trial-dev-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
        debugger
        let fileurl = oEvent.getSource().getUrl();
        var pattern = /Files.*$/;
        var match = fileurl.match(pattern);
        if (match) {
          var entityUrl = baseUrl + match[0];
        }
        oEvent.getSource().setUrl(entityUrl);
        debugger
      },

      onAfterRendering: function () {
        // Call the function to check the ID and update attributes
        debugger
        this.checkAndUpdateDiv();

        // Example aggregate logic: sum the values of all visible divs with specific attributes
        let total = 0;

        // Find all divs with specific attributes
        jQuery("div[data-value]").each(function () {
          let value = parseFloat(jQuery(this).data("value")) || 0; // Safely parse the value
          total += value; // Aggregate the value
        });

        console.log("Aggregate function executed. Total sum of div values:", total);
        // You can do something with the total, like updating a model or UI element
      },

      checkAndUpdateDiv: function () {
        // Define the ID of the div to check
        var divId = "__component6---App--object13-anchBar-__component6---App--commentSection-anchor";

        // Try to get the control by ID using jQuery
        var oDiv = jQuery("#" + divId);

        // Check if the specific div was found
        if (oDiv.length) { // Check if the jQuery object is not empty
          // If found, set it to invisible
          oDiv.hide(); // Make the div invisible
          console.log("Div found and set to invisible.");

          // Update properties as needed
          oDiv.attr("role", "none"); // Example: change role
          oDiv.attr("aria-selected", "false"); // Example: change aria-selected
          // Add any other property updates here
        } else {
          console.log("Div not found.");
        }
      },

      onBrowseHistoryPress: function () {
        var oDialog = this.byId("commentHistoryDialog");

        if (!oDialog) {
          this.loadFragment({
            name: "workflowmanagement.workflowuimodule.view.CommentHistoryDialog"
          }).then(function (oDialog) {
            oDialog.open();
            this._attachClickOutsideListener(oDialog);
          }.bind(this));
        } else {
          oDialog.open();
          this._attachClickOutsideListener(oDialog);
        }
      },


      // // _PostComment: function () {
      // //   debugger
      // //   var oView = this.getView();
      // //   var sCommentText = oView.byId("_IDGenTextArea").getValue(); // Get the entered comment
      // //   // var sUserID = "PrinceKumar"; // You can dynamically set this based on the current user session
      // //   var oData = oView.oPropagatedProperties.oModels.context.oData;
      // //   var baseUrl = JSON.parse(oData.link);
      // //   var soID = baseUrl[0].soID;
      // //   // Perform POST request to submit the comment
      // //   var baseUrlComments = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
      // //   var urlll = `Comment`;

      // //   $.ajax({
      // //     url: baseUrlComments + urlll,
      // //     method: "POST",
      // //     contentType: "application/json",
      // //     data: JSON.stringify({
      // //       // commentID: "C3", // Generate a unique ID for the comment if necessary
      // //       // createdBy: sUserID, // Add the user who created the comment
      // //       // createdAt: new Date().toISOString(), // Add the current date/time
      // //       soID:soID,
      // //       commentsText: sCommentText,
      // //       IsActiveEntity: true, // Add the comment entered by the user
      // //     }),
      // //     success: function (oData) {
      // //       console.log("Comment Posted", oData);

      // //       // Update the comment model to reflect the newly posted comment
      // //       var oCommentModel = oView.getModel("commentModel");
      // //       if (!oCommentModel) {
      // //         oCommentModel = new sap.ui.model.json.JSONModel();
      // //         oView.setModel(oCommentModel, "commentModel");
      // //       }
      // //       oCommentModel.setProperty("/Comment", sCommentText); // Update the model with the posted comment

      // //       // Clear the textarea (optional, depending on your use case)
      // //       // oView.byId("_IDGenTextArea").setValue("");
      // //     },
      // //     error: function (jqXHR, textStatus, errorThrown) {
      // //       console.error("Error posting comment: " + textStatus + ' ' + errorThrown);
      // //     }
      // //   });
      // // },

      // // onDataChange: function () {
      // //   debugger;
      // //   var oView = this.getView();

      // //   // Fetch the table by its ID
      // //   var oTable = oView.byId("delivery-details-table");

      // //   // Get the binding context (model) from the table
      // //   var oModel = oTable.getModel("myModel");
      // //   var sPath = "/Files"; // Path to the delivery data in your model 

      // //   // Get the data from the model (this will include all the fields in the section)
      // //   var oDeliveryData = oModel.getProperty(sPath);

      // //   // Loop through each delivery entry using forEach
      // //   oDeliveryData.forEach(function (oDeliveryRow) {
      // //     // Prepare the data for the delivery section
      // //     var deliveryData = {
      // //       vehicleID: oDeliveryRow.vehicleID, // Include unique identifier
      // //       vehicleCode: oDeliveryRow.vehicleCode,
      // //       deliveryLeadTime: oDeliveryRow.deliveryLeadTime,
      // //       deliveryDate: oDeliveryRow.deliveryDate,
      // //       shippingMethod: oDeliveryRow.shippingMethod,
      // //       shippingCharges: oDeliveryRow.shippingCharges
      // //     };
      // //     debugger;

      // //     // You can proceed to send this individual delivery data to your backend
      // //     var baseUrlDelivery = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/"; // Construct URL with unique ID
      // //     const url = `SalesVehicle(vehicleID=${oDeliveryRow.vehicleID})`;

      // //     $.ajax({
      // //       url: baseUrlDelivery + url,
      // //       method: "PATCH", // Use "PATCH" for updating existing records
      // //       contentType: "application/json",
      // //       data: JSON.stringify(deliveryData), // Send the individual delivery data
      // //       success: function (oData) {
      // //         console.log("Delivery Details Updated for vehicle ID:", oDeliveryRow.vehicleID, oData);
      // //       },
      // //       error: function (jqXHR, textStatus, errorThrown) {
      // //         console.error("Error updating delivery details for vehicle ID " + oDeliveryRow.vehicleID + ": " + textStatus + ' ' + errorThrown);
      // //       }
      // //     });
      // //   });
      // // },



      // // onLiveChange: function () {
      // //   debugger
      // //   // Get the view
      // //   var oView = this.getView();

      // //   // Get the SimpleForm instance by ID
      // //   var oForm = oView.byId("payment-details-form");

      // //   // Initialize an object to store the form data
      // //   var oFormData = {};

      // //   // Get all the controls inside the SimpleForm
      // //   var aFormContent = oForm.getContent();

      // //   // Loop through the form content to find Input fields and get their values
      // //   aFormContent.forEach(function (oControl) {
      // //     if (oControl instanceof sap.m.Input) {
      // //       // Get the input field's ID to map it dynamically to form data properties
      // //       var sControlId = oControl.getId();

      // //       // Map each input's value to the appropriate property in the data object
      // //       switch (sControlId) {
      // //         case oView.byId("bankName-input").getId():
      // //           oFormData.bankName = oControl.getValue();
      // //           break;
      // //         case oView.byId("accNumber-input").getId():
      // //           oFormData.accNumber = oControl.getValue();
      // //           break;
      // //         case oView.byId("ifscCode-input").getId():
      // //           oFormData.ifscCode = oControl.getValue();
      // //           break;
      // //         case oView.byId("branch-input").getId():
      // //           oFormData.branch = oControl.getValue();
      // //           break;
      // //         case oView.byId("accHoldersName-input").getId():
      // //           oFormData.accHoldersName = oControl.getValue();
      // //           break;
      // //         case oView.byId("dueDate-input").getId():
      // //           oFormData.dueDate = oControl.getValue();
      // //           break;
      // //       }
      // //     }
      // //   });

      //   // Now, oFormData contains all the form values
      //   console.log(oFormData); // For debugging
      //   var oData = oView.oPropagatedProperties.oModels.context.oData;
      //   var baseUrl = JSON.parse(oData.link);
      //   var soID = baseUrl[0].soID;
      //   // You can proceed to send this object to your backend
      //   var baseUrlPayment = "https://5b8242e5trial-dev-04-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/"; // Your backend URL
      //   const urll = `SalesOrder(soID='${soID}',IsActiveEntity=true)`;
      //   $.ajax({
      //     url: baseUrlPayment + urll,
      //     method: "PATCH", // PATCH since you're updating existing data
      //     contentType: "application/json",
      //     data: JSON.stringify(oFormData), // Send the form data object
      //     success: function (oData) {
      //       console.log("Payment Details Updated Successfully", oData);
      //     },
      //     error: function (jqXHR, textStatus, errorThrown) {
      //       console.error("Error updating payment details: " + textStatus + ' ' + errorThrown);
      //     }
      //   });
      // },


      onCloseHistoryDialog: function () {
        var oDialog = this.byId("commentHistoryDialog");
        oDialog.close();
        this._detachClickOutsideListener();
      },

      _attachClickOutsideListener: function (oDialog) {
        var $dialog = oDialog.$(); // Get jQuery reference to dialog DOM element
        var that = this;

        this._outsideClickHandler = function (oEvent) {
          if (!$dialog[0].contains(oEvent.target)) {
            that.onCloseHistoryDialog();
          }
        };

        // Attach event listener for clicks outside the dialog
        $(document).on("mousedown", this._outsideClickHandler);
      },

      _detachClickOutsideListener: function () {
        // Remove the click outside event listener
        if (this._outsideClickHandler) {
          $(document).off("mousedown", this._outsideClickHandler);
          this._outsideClickHandler = null;
        }
      },


      onFilterTypeChange: function (oEvent) {
        // Logic for changing the filter in the timeline based on selection
        var sKey = oEvent.getSource().getSelectedKey();
        var oTimeline = this.byId("commentTimeline");
        oTimeline.setGroupBy(sKey);
      },
      onEscapeHandler: function (oPromise) {
        this.byId("commentHistoryDialog").close();
        oPromise.resolve();
      },

      onCloseHistoryDialog: function () {
        this.byId("commentHistoryDialog").close();
      },
    }
  );
});
