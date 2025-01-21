sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"], function (BaseController, JSONModel) {
  "use strict";

  return BaseController.extend(
    "FinanceWorkflow.workflowuiFinance.controller.App",
    {

      formatPartnerRoleInline: function (sValue) {
        if (sValue === "SP") return `${sValue} (Sold-to-party)`;
        else if (sValue === "SH") return `${sValue} (Ship-to-party)`;
        else if (sValue === "PY") return `${sValue} (Payer)`;
        else if (sValue === "BP") return `${sValue} (Bill-to-party)`;
        else return sValue;
      },

      onInit: function () {
        // debugger
        // Static order date as the minimum date allowed
        // var orderDate = new Date("2024-09-01"); // Minimum selectable date
        var oUploadSet = this.byId("uploadSet1");
        oUploadSet.setMode("None");
        // this.initializeDatePickerMinDate();
        // this.initializeDatePickerMinDateForDueDate();
        // var oUploadSet = this.byId("uploadSet");
        // debugger
        // Set the mode to 'None' to disable checkboxes
        // oUploadSet.setMode("None");

        // // Access the toolbar and modify its content
        // var oUploadButton = sap.ui.getCore().byId("__component1---App--uploadSet1-uploader-fu_button");
        // debugger
        // if (oUploadButton) {
        //   oUploadButton.setVisible(false); // Hide the button
        // }
        // this.initializeDatePickerMinDateForPrefferedDeliveryDate();// Access the UploadSet instance
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
        debugger
        var uploadSet = this.getView().mAggregations.content[0].mAggregations.pages[0].mAggregations.sections[6].mAggregations._grid.mAggregations.content[0].mAggregations.blocks[0];
        uploadSet.setUploadButtonInvisible(true);
        // uploadSet.setMode("None");
        // Third AJAX call for PDF files
        setTimeout(function () {
          var oView = this.getView();
          debugger
          var oModel = new sap.ui.model.json.JSONModel();
          debugger;
          var oData = oView.oPropagatedProperties.oModels.context?.oData;

          // var fileData = oData.Files;
          if (oData.Files && Array.isArray(oData.Files)) {
            const fileData = oData.Files;

            console.log(fileData); // Check if fileData contains the expected array

            // Set the full array to the model
            oModel.setData({ pdf: fileData });

            // Set the model to the view
            oView.setModel(oModel, "myFile");

            console.log("Model set successfully:", oModel.getData());
          } else {
            console.error("filelink is missing or not an array");
          }
        }.bind(this), 1000);
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

            try {
              // Second AJAX call for comment history data
              debugger
              var commentsData = JSON.parse(oData.commentLink);
              debugger
              if (commentsData) {
                // const baseUrlComments = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/";
                // const curl = baseUrlComments + `PurchaseOrder(purchaseOrderUuid = ${ purchaseOrderId }, IsActiveEntity = true) / purchaseToComments ? $orderby = createdAt asc`;

                // const commentsData = await $.ajax({ url: curl, method: "GET" });

                // Filter out comments that start with 10 digits
                const filteredComments = commentsData.filter(comment => !/^\d{10}/.test(comment.commentsText));
                debugger
                var oModelComments = new sap.ui.model.json.JSONModel();
                oModelComments.setData({ Comments: filteredComments });
                debugger
                oView.setModel(oModelComments, "myComments");
                console.log("Filtered Comments Data", filteredComments);

                // Scroll to the latest comment after data is set
                oModelComments.attachEventOnce("change", function () {
                  this._scrollToLatestComment();
                }.bind(this), 1000);
              } else {
                console.warn("PurchaseOrderUuid not available in base URL data.");
              }
            } catch (error) {
              console.error("Error during AJAX requests:", error);
            }



          } catch (error) {
            console.error("Error during AJAX requests:", error);
          }
        }.bind(this), 1000);

        setTimeout(function () {
          var oView = this.getView();
          var oModel9 = new sap.ui.model.json.JSONModel();
          debugger;

          var oData9 = oView.oPropagatedProperties.oModels.context.oData;

          // Check if filelink exists and is an array
          if (oData9.patner && Array.isArray(oData9.patner)) {
            const partnerData = oData9.patner;

            console.log(partnerData);
            // Set the full array to the model
            oModel9.setData({ patner: partnerData });

            // Set the model to the view
            oView.setModel(oModel9, "mydetail");

            console.log("Model set successfully:", oModel9.getData());
          } else {
            console.error("partner is missing or not an array");
          }
        }.bind(this), 1000);

        //AJAX CALLS FOR SALES ORG, DOC TYPE, DIVISION AND DISTRIBUTION CHANNEL 
        setTimeout(function () {
          var oView = this.getView();
          var oModel = new sap.ui.model.json.JSONModel();
          debugger;
          var oData = oView.oPropagatedProperties.oModels.context.oData;
          var salesOrg = oData.salesOrg;

          var baseUrl1 = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
          var filterUrl = baseUrl1 + `? $filter = sHId eq '${salesOrg}'`;

          $.ajax({
            url: filterUrl,
            method: "GET",
            success: function (oData12) {
              var descri = oData12.value[0].sHDescription;
              oModel.setData({ SalesOrgDescription: descri });
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

          var baseUrl2 = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
          var filterUrl1 = baseUrl2 + `? $filter = sHId2 eq '${districhannel}' and sHField2 eq 'DistributionChannels'`;

          $.ajax({
            url: filterUrl1,
            method: "GET",
            success: function (oData13) {
              var nutty = oData13.value[0].sHDescription2;
              oModel.setData({ Distribution: nutty });
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

          var baseUrl3 = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
          var filterUrl2 = baseUrl3 + `? $filter = sHId2 eq '${divi}' and sHField2 eq 'Division'`;

          $.ajax({
            url: filterUrl2,
            method: "GET",
            success: function (oData14) {
              var diving = oData14.value[0].sHDescription2;
              oModel.setData({ Divis: diving });
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

          var baseUrl4 = "https://44f10b5ftrial-dev1-mahindra-sales-srv.cfapps.us10-001.hana.ondemand.com/odata/v4/my/SH";
          var filterUrl3 = baseUrl4 + `? $filter = sHId eq '${docu}'`;

          $.ajax({
            url: filterUrl3,
            method: "GET",
            success: function (oData15) {
              var doctype = oData15.value[0].sHDescription;
              oModel.setData({ Documentty: doctype });
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
        var oView = this.getView();
        // var oModel9 = new sap.ui.model.json.JSONModel();
        var oData = oView.oPropagatedProperties.oModels.context.oData;
        var Url = oData.baseUrl;
        if (Url.includes("../")) {
          Url = Url.replace(/\.\.\//g, "/"); // Replace "../" with "/"
        }
        
        var mainUrl = "https://44f10b5ftrial.launchpad.cfapps.us10.hana.ondemand.com";
        var baseUrl = mainUrl + Url;
        debugger
        let fileurl = oEvent.getSource().getUrl();
        var pattern = /EnquiryFiles.*$/;
        var match = fileurl.match(pattern);
        if (match) {
          var entityUrl = baseUrl + match[0];
        }
        oEvent.getSource().setUrl(entityUrl);
        debugger
      },
      
      
      

      // Event handler for the delivery date change
      // onDataChange: function () {
      //   debugger;
      //   var oView = this.getView();

      //   // Fetch the delivery details table to get delivery dates
      //   var oTable = oView.byId("delivery-details-table");
      //   var earliestDeliveryDate = null;

      //   if (oTable) {
      //     var oModel = oTable.getModel("myModel");
      //     var sPath = "/Files"; // Path to the delivery data in the model
      //     var oDeliveryData = oModel.getProperty(sPath);

      //     console.log("Delivery Data Retrieved:", oDeliveryData);
      //     debugger;

      //     // Parse if the data is a JSON string
      //     if (typeof oDeliveryData === "string") {
      //       try {
      //         oDeliveryData = JSON.parse(oDeliveryData);
      //         console.log("Parsed oDeliveryData:", oDeliveryData);
      //       } catch (error) {
      //         console.error("Failed to parse oDeliveryData:", error);
      //         return; // Exit the function as the data is invalid
      //       }
      //     }

      //     // Ensure the data is an array
      //     if (oDeliveryData && Array.isArray(oDeliveryData)) {
      //       // Get POReleaseDate dynamically from the model data
      //       var oData = oView.oPropagatedProperties.oModels.context.oData;
      //       var poReleaseDate = new Date(oData.POReleaseDate); // Use POReleaseDate as the order date

      //       // Iterate over the delivery data to process each row
      //       oDeliveryData.forEach(function (oDeliveryRow, index) {
      //         console.log(`Row ${index + 1} Data:`, oDeliveryRow);

      //         // Calculate deliveryLeadTime
      //         if (oDeliveryRow.delDate) {
      //           var deliveryDate = new Date(oDeliveryRow.delDate);
      //           console.log(`Row ${index + 1} Delivery Date Parsed:`, deliveryDate);

      //           deliveryDate.setHours(0, 0, 0, 0); // Normalize to midnight for consistency

      //           // Update earliestDeliveryDate if this deliveryDate is earlier
      //           if (!earliestDeliveryDate || deliveryDate < earliestDeliveryDate) {
      //             earliestDeliveryDate = deliveryDate;
      //           }

      //           // Calculate the lead time based on POReleaseDate
      //           var timeDiff = Math.abs(deliveryDate.getTime() - poReleaseDate.getTime());
      //           var deliveryLeadTime = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Lead time in days
      //           var formattedLeadTime = deliveryLeadTime + " days";

      //           // Update the deliveryLeadTime in the model
      //           var rowPath = sPath + "/" + index + "/deliveryLeadTime";
      //           oModel.setProperty(rowPath, formattedLeadTime);
      //           console.log("Updated delivery lead time for vehicle ID:", oDeliveryRow.vehicleID, "Lead Time:", formattedLeadTime);

      //         } else {
      //           console.warn(`Row ${index + 1} has no valid delivery date.`);
      //         }
      //       });

      //       console.log("Earliest Delivery Date Found:", earliestDeliveryDate);
      //     } else {
      //       console.warn("No delivery data found or delivery data is not an array.");
      //     }
      //   } else {
      //     console.warn("Delivery details table not found.");
      //   }

      //   // Additional logic for setting the Due Date DatePicker
      //   var oDatePicker = oView.byId("dueDate-input");
      //   debugger;
      //   if (oDatePicker) {
      //     // If no delivery date is found, set the minimum date to today's date
      //     var currentDate = new Date();
      //     currentDate.setHours(0, 0, 0, 0);

      //     // Calculate the max due date: one day before the earliest delivery date
      //     var maxDueDate = earliestDeliveryDate
      //       ? new Date(earliestDeliveryDate.getTime() - 24 * 60 * 60 * 1000)
      //       : null; // Subtract one day (in milliseconds)

      //     // Ensure minDueDate is today's date
      //     var minDueDate = currentDate;

      //     if (maxDueDate && maxDueDate < minDueDate) {
      //       console.warn("Invalid range: maxDueDate is earlier than minDueDate. Adjusting to today's date.");
      //       maxDueDate = minDueDate;
      //     }

      //     // Set the min and max dates on the Due Date DatePicker
      //     oDatePicker.setMinDate(minDueDate);
      //     if (maxDueDate) {
      //       oDatePicker.setMaxDate(maxDueDate);
      //     }

      //     // Retrieve the current dateValue of the DatePicker
      //     var dateValue = oDatePicker.getDateValue();
      //     if (dateValue && (dateValue < minDueDate || (maxDueDate && dateValue > maxDueDate))) {
      //       // Adjust the due date if it falls outside the allowed range
      //       var adjustedDate = dateValue < minDueDate ? minDueDate : maxDueDate;
      //       oDatePicker.setDateValue(adjustedDate);
      //       console.warn("Adjusted invalid due dateValue to:", adjustedDate);
      //     }

      //     console.log("Due Date Picker constraints set:");
      //     console.log(" - Minimum date:", minDueDate);
      //     console.log(" - Maximum date:", maxDueDate);
      //   } else {
      //     console.warn("Due Date DatePicker control not found.");
      //   }
      // },








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

          // Validate and adjust the current dateValue if necessary
          var dateValue = oDatePicker.getDateValue();
          if (dateValue && dateValue < currentDate) {
            oDatePicker.setDateValue(currentDate); // Adjust invalid dateValue
            console.warn("Adjusted invalid dateValue to:", currentDate);
          }
        } else {
          console.warn("DatePicker control not found");
        }
      },

      initializeDatePickerMinDateForDueDate: function () {
        debugger;
        var oView = this.getView();

        // Fetch the delivery details table to get delivery dates
        var oTable = oView.byId("delivery-details-table");
        var earliestDeliveryDate = null;

        if (oTable) {
          var oData = oView.oPropagatedProperties.oModels.context.oData;
          var oDeliveryData = oData.link;

          console.log("Delivery Data Retrieved:", oDeliveryData);
          debugger
          // Parse if the data is a JSON string
          if (typeof oDeliveryData === "string") {
            try {
              oDeliveryData = JSON.parse(oDeliveryData);
              console.log("Parsed oDeliveryData:", oDeliveryData);
            } catch (error) {
              console.error("Failed to parse oDeliveryData:", error);
              return; // Exit the function as the data is invalid
            }
          }

          // Ensure the data is an array
          if (oDeliveryData && Array.isArray(oDeliveryData)) {
            // Iterate over the delivery data to find the earliest delivery date
            oDeliveryData.forEach(function (oDeliveryRow, index) {
              console.log(`Row ${index + 1} Data:`, oDeliveryRow);

              if (oDeliveryRow.delDate) {
                debugger;
                var deliveryDate = new Date(oDeliveryRow.delDate);
                console.log(`Row ${index + 1} Delivery Date Parsed:`, deliveryDate);

                deliveryDate.setHours(0, 0, 0, 0); // Normalize to midnight for consistency

                // Update earliestDeliveryDate if this deliveryDate is earlier
                if (!earliestDeliveryDate || deliveryDate < earliestDeliveryDate) {
                  earliestDeliveryDate = deliveryDate;
                }
              } else {
                console.warn(`Row ${index + 1} has no valid delivery date.`);
              }
            });

            console.log("Earliest Delivery Date Found:", earliestDeliveryDate);
          } else {
            console.warn("No delivery data found or delivery data is not an array.");
          }
        } else {
          console.warn("Delivery details table not found.");
        }

        // Additional logic for setting the Due Date DatePicker..    

        // Access the Due Date DatePicker control
        var oDatePicker = oView.byId("dueDate-input");
        debugger
        if (oDatePicker) {
          // If no delivery date is found, set the minimum date to today's date
          var currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0);

          // Calculate the max due date: one day before the earliest delivery date
          var maxDueDate = earliestDeliveryDate
            ? new Date(earliestDeliveryDate.getTime() - 24 * 60 * 60 * 1000)
            : null; // Subtract one day (in milliseconds)

          // Ensure minDueDate is today's date
          var minDueDate = currentDate;

          if (maxDueDate && maxDueDate < minDueDate) {
            console.warn("Invalid range: maxDueDate is earlier than minDueDate. Adjusting to today's date.");
            maxDueDate = minDueDate;
          }

          // Set the min and max dates on the Due Date DatePicker
          oDatePicker.setMinDate(minDueDate);
          if (maxDueDate) {
            oDatePicker.setMaxDate(maxDueDate);
          }

          // Retrieve the current dateValue of the DatePicker
          var dateValue = oDatePicker.getDateValue();
          if (dateValue && (dateValue < minDueDate || (maxDueDate && dateValue > maxDueDate))) {
            // Adjust the due date if it falls outside the allowed range
            var adjustedDate = dateValue < minDueDate ? minDueDate : maxDueDate;
            oDatePicker.setDateValue(adjustedDate);
            console.warn("Adjusted invalid due dateValue to:", adjustedDate);
          }

          console.log("Due Date Picker constraints set:");
          console.log(" - Minimum date:", minDueDate);
          console.log(" - Maximum date:", maxDueDate);
        } else {
          console.warn("Due Date DatePicker control not found.");
        }
      },


      initializeDatePickerMinDateForPrefferedDeliveryDate: function () {
        var oView = this.getView();
        // Get the current date
        var currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Set the time to midnight to avoid time issues
        console.log("Current Date:", currentDate);

        // Access the DatePicker control and set the minimum date to today
        var oDatePicker = oView.byId("_IDGenDatePicker1");
        if (oDatePicker) {
          oDatePicker.setMinDate(currentDate);

          // Validate and adjust the current dateValue if necessary
          var dateValue = oDatePicker.getDateValue();
          if (dateValue && dateValue < currentDate) {
            oDatePicker.setDateValue(currentDate); // Adjust invalid dateValue
            console.warn("Adjusted invalid dateValue to:", currentDate);
          }

          console.log("Minimum date set on DatePicker to:", currentDate);
        } else {
          console.warn("DatePicker control not found");
        }
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
      onDialogOpen: function () {
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
