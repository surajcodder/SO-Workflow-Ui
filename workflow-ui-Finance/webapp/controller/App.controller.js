sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend(
    "FinanceWorkflow.workflowuiFinance.controller.App",
    {
      onInit: function () {
        debugger
        // Static order date as the minimum date allowed
        // var orderDate = new Date("2024-09-01"); // Minimum selectable date
        var oUploadSet = this.byId("uploadSet1");
        oUploadSet.setMode("None");
        this.initializeDatePickerMinDate();
        this.initializeDatePickerMinDateForDueDate();// Access the UploadSet instance
        // var oUploadSet = sap.ui.getCore().byId("uploadSet1");
        
        // // Access the toolbar of the UploadSet
        // var oToolbar = oUploadSet.getToolbar();
        
        // // Find and remove the Upload button from the toolbar
        // if (oToolbar) {
        //     var aToolbarContent = oToolbar.getContent();
        //     aToolbarContent.forEach(function (oControl) {
        //         // Check for Upload button (usually a Button or control with specific role)
        //         if (oControl.getText && oControl.getText() === "Upload") {
        //             oToolbar.removeContent(oControl);
        //         }
        //     });
        // }
        

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
        // Third AJAX call for PDF files
        var oView = this.getView();
        var baseUrl = "https://f2dbf934trial-hanapri-uni-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/Files";
        var url1 = "https://f2dbf934trial-hanapri-uni-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/"
        debugger
        // Perform AJAX request to retrieve data
        $.ajax({
          url: baseUrl,
          method: "GET",
          success: function (oData) {
            debugger
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
        debugger
        setTimeout(async function () {
          debugger
          var oView = this.getView();
          var oData = oView.oPropagatedProperties.oModels.context?.oData;

          if (!oData) {
            console.warn("No data available in context.");
            return;
          }

          try {
            // Extract link data
            var baseUrl = JSON.parse(oData.link);

            // Prepare model for the base link data
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({ Files: baseUrl });
            oView.setModel(oModel, "myModel");

            // If data is in array format, log the delivery lead time
            if (Array.isArray(baseUrl)) {
              baseUrl.forEach(function (item, index) {
                console.log("Delivery Lead Time for item " + index + ": " + item.deliveryLeadTime);
              });
            } else {
              console.error("Data is not in the expected array format.");
            }

            // Second AJAX call for comment history data
            var purchaseOrderId = baseUrl[0]?.purchaseOrderUuid.replace(/['"]/g, '');
            if (purchaseOrderId) {
              const baseUrlComments = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
              const curl = baseUrlComments + `PurchaseOrder(purchaseOrderUuid=${purchaseOrderId},IsActiveEntity=true)/purchaseToComments?$orderby=createdAt asc`;

              const commentsData = await $.ajax({ url: curl, method: "GET" });
              var oModelComments = new sap.ui.model.json.JSONModel();
              oModelComments.setData({ Comments: commentsData.value });
              oView.setModel(oModelComments, "myComments");
              console.log("Comments Data", commentsData);
              // Scroll to the latest comment after data is set
              debugger
              oModelComments.attachEventOnce("change", function () {
                debugger
                this._scrollToLatestComment();
            }.bind(this), 1000);            
            } else {
              console.warn("PurchaseOrderUuid not available in base URL data.");
            }
            debugger


          } catch (error) {
            console.error("Error during AJAX requests:", error);
          }
        }.bind(this), 300);

          //AJAX CALLS FOR SALES ORG, DOC TYPE, DIVISION AND DISTRIBUTION CHANNEL 
          setTimeout(function () {
            var oView = this.getView();
            var oModel = new sap.ui.model.json.JSONModel();
            debugger;
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var salesOrg = oData.salesOrg;
        
            var baseUrl1 = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
            var filterUrl = baseUrl1 + `?$filter=sHId eq '${salesOrg}'`;
        
            $.ajax({
              url: filterUrl,
              method: "GET",
              success: function (oData12) {
                var descri = oData12.value[0].sHDescription;
                oModel.setData({SalesOrgDescription:descri});
                oView.setModel(oModel, "SalesModel");
                debugger
                console.log("SH Description:", descri);
                console.log(oView);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: " + textStatus + " " + errorThrown);
              },
            });
          }.bind(this), 1000);
      
          setTimeout(function () {
            var oView = this.getView();
            var oModel = new sap.ui.model.json.JSONModel();
            debugger;
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var districhannel = oData.distributionChannels;
        
            var baseUrl2 = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
            var filterUrl1 = baseUrl2 + `?$filter=sHId eq '${districhannel}'`;
        
            $.ajax({
              url: filterUrl1,
              method: "GET",
              success: function (oData13) {
                var nutty = oData13.value[0].sHDescription;
                oModel.setData({Distribution:nutty});
                oView.setModel(oModel, "DistributionModel");
                debugger
                console.log("SH Description:", nutty);
                console.log(oView);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: " + textStatus + " " + errorThrown);
              },
            });
          }.bind(this), 1000);
      
          setTimeout(function () {
            var oView = this.getView();
            var oModel = new sap.ui.model.json.JSONModel();
            debugger;
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var divi = oData.division;
        
            var baseUrl3 = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
            var filterUrl2 = baseUrl3 + `?$filter=sHId eq '${divi}'`;
        
            $.ajax({
              url: filterUrl2,
              method: "GET",
              success: function (oData14) {
                var diving = oData14.value[0].sHDescription;
                oModel.setData({Divis:diving});
                oView.setModel(oModel, "DivisionModel");
                debugger
                console.log("SH Description:", diving);
                console.log(oView);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: " + textStatus + " " + errorThrown);
              },
            });
          }.bind(this), 1000);
      
          setTimeout(function () {
            var oView = this.getView();
            var oModel = new sap.ui.model.json.JSONModel();
            debugger;
            var oData = oView.oPropagatedProperties.oModels.context.oData;
            var docu = oData.docType;
        
            var baseUrl4 = "https://5b8242e5trial-dev-04-mahindra-project-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
            var filterUrl3 = baseUrl4 + `?$filter=sHId eq '${docu}'`;
        
            $.ajax({
              url: filterUrl3,
              method: "GET",
              success: function (oData15) {
                var doctype = oData15.value[0].sHDescription;
                oModel.setData({Documentty:doctype});
                oView.setModel(oModel, "DocumentModel");
                debugger
                console.log("SH Description:", doctype);
                console.log(oView);
              },
              error: function (jqXHR, textStatus, errorThrown) {
                console.error("Error fetching data: " + textStatus + " " + errorThrown);
              },
            });
          }.bind(this), 1000);



      },

      onOpenPressed: function (oEvent) {
        debugger
        var baseUrl = "https://f2dbf934trial-hanapri-uni-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
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

      // Event handler for the delivery date change
      onDataChange: function () {
        debugger;
        var oView = this.getView();

        // Get POReleaseDate dynamically from the model data
        var oData = oView.oPropagatedProperties.oModels.context.oData;
        var poReleaseDate = new Date(oData.POReleaseDate); // Use POReleaseDate as the order date

        var oTable = oView.byId("delivery-details-table");

        if (oTable) {
          var oModel = oTable.getModel("myModel");
          var sPath = "/Files"; // Path to the delivery data in the model
          var oDeliveryData = oModel.getProperty(sPath);

          // Loop through each delivery entry
          oDeliveryData.forEach(function (oDeliveryRow, index) {
            // Fetch the delivery date from the data
            var deliveryDateString = oDeliveryRow.deliveryDate;
            var deliveryDate = deliveryDateString ? new Date(deliveryDateString) : null;

            if (deliveryDate && !isNaN(deliveryDate.getTime())) {
              // Calculate the difference in days between delivery date and POReleaseDate
              var timeDiff = Math.abs(deliveryDate.getTime() - poReleaseDate.getTime());
              var deliveryLeadTime = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Lead time in days

              // Create a formatted lead time with ' days' suffix for model update
              var formattedLeadTime = deliveryLeadTime + " days";

              // Update the deliveryLeadTime in the model immediately with formatted value
              var rowPath = sPath + "/" + index + "/deliveryLeadTime";
              oModel.setProperty(rowPath, formattedLeadTime); // Update the model with formatted lead time
              console.log("Updated delivery lead time for vehicle ID:", oDeliveryRow.vehicleID, "Lead Time:", formattedLeadTime);
            } else {
              console.error("Invalid or missing delivery date for vehicle ID: " + oDeliveryRow.vehicleID);
            }
          });
        }
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
          total += value; // \ the value
        });

        console.log("Aggregate function executed. Total sum of div values:", total);
        // You can do something with the total, like updating a model or UI element


        // var oView = this.getView();
        // var oDatePicker = oView.byId("_IDGenDatePicker");

        // // Check if we have a valid POReleaseDate and DatePicker control
        // if (oDatePicker && this.poReleaseDate) {
        //   // Set the minimum date constraint using the POReleaseDate stored from onBeforeRendering
        //   oDatePicker.setMinDate(this.poReleaseDate);
        //   console.log("Minimum date set on DatePicker to:", this.poReleaseDate);
        // } else {
        //   console.warn("DatePicker or POReleaseDate not available during onAfterRendering");
        // }
      },
      initializeDatePickerMinDate: function () {
        setTimeout(function () {
          var oView = this.getView();

          // Get the current date and set it to midnight to avoid time issues
          var currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Midnight ensures no overlap with past times
          console.log("Current Date:", currentDate);

          // Access the DatePicker control and set the minimum date to today
          var oDatePicker = oView.byId("_IDGenDatePicker");
          if (oDatePicker) {
            oDatePicker.setMinDate(currentDate); // Setting minDate ensures past dates are not selectable
            console.log("Minimum date set on DatePicker to:", currentDate);
          } else {
            console.warn("DatePicker control not found");
          }
        }.bind(this), 500); // Delay execution by 500ms to ensure the control is fully loaded
      },


      initializeDatePickerMinDateForDueDate: function () {
        setTimeout(function () {
          var oView = this.getView();
          // Get the current date
          var currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Set the time to midnight to avoid time issues
          console.log("Current Date:", currentDate);

          // Access the DatePicker control and set the minimum date to today
          var oDatePicker = oView.byId("dueDate-input");
          if (oDatePicker) {
            oDatePicker.setMinDate(currentDate);
            console.log("Minimum date set on DatePicker to:", currentDate);
          } else {
            console.warn("DatePicker control not found");
          }
        }.bind(this), 500); // Delay execution by 500ms
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
        debugger
        var oDialog = this.byId("commentHistoryDialog");
        var oScrollContainer = this.byId("scrollContainer");

        if (!oDialog) {
          this.loadFragment({
            name: "workflowmanagement.workflowuimodule.view.CommentHistoryDialog"
          }).then(function (oDialog) {
            oDialog.open();
            this._attachClickOutsideListener(oDialog); 

            // Ensure the Timeline scrolls to the bottom after the dialog is loaded
            this._scrollToLatestComment();
          }.bind(this));
        } else {
          oDialog.open();
          this._attachClickOutsideListener(oDialog);

          // Ensure the Timeline scrolls to the bottom when reopened
          this._scrollToLatestComment();
          debugger
        }
      },


      _scrollToLatestComment: function () {
        debugger
        var oScrollContainer = this.byId("scrollContainer");
        var oDomRef = oScrollContainer.getDomRef();
        debugger
        var height = oDomRef.scrollHeight;
        
        debugger
    
        if (oDomRef) {
          oScrollContainer.scrollTo(0, height, 0);
            // Delay ensures rendering is complete before scrolling
            // setTimeout(function () {
            //     oDomRef.scrollTop = oDomRef.scrollHeight; // Scroll to the bottom
            // },300); // Adjust delay time if necessary
        }
    },    
    onDialogOpen: function() {
      debugger
      this._scrollToLatestComment();
  },       


      // onCloseHistoryDialog: function () {
      //   var oDialog = this.byId("commentHistoryDialog");
      //   oDialog.close();
      //   this._detachClickOutsideListener();
      // },

      // _attachClickOutsideListener: function (oDialog) {
      //   var $dialog = oDialog.$(); // Get jQuery reference to dialog DOM element
      //   var that = this;

      //   this._outsideClickHandler = function (oEvent) {
      //     if (!$dialog[0].contains(oEvent.target)) {
      //       that.onCloseHistoryDialog();
      //     }
      //   };

      //   // Attach event listener for clicks outside the dialog
      //   $(document).on("mousedown", this._outsideClickHandler);
      // },

      // _detachClickOutsideListener: function () {
      //   // Remove the click outside event listener
      //   if (this._outsideClickHandler) {
      //     $(document).off("mousedown", this._outsideClickHandler);
      //     this._outsideClickHandler = null;
      //   }
      // },

      onCloseHistoryDialog: function () {
        debugger
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

      
    }
  );
});
