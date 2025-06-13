/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    './serp_cm_shipcommand',
    './serp_cm_chartdata'
],

(scLib, chartLib) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            const request = scriptContext.request
            const params = request.parameters
            log.audit('-------- [START] --------', params.mode)
    
            if (request.method === 'GET') {
                switch (params.mode) {
                    case 'getChartOrders':
                        chartLib.PieChart.getOrders(scriptContext)
                        break
                    case 'getShippingCost':
                        chartLib.PieChart.getShippingCost(scriptContext)
                        break
                    case 'getOrderFulfillmentCycleTime':
                        chartLib.CarouselChart.getOrderFulfillmentCycleTime(scriptContext)
                        break
                    case 'getPickedFulfillments':
                        chartLib.CarouselChart.getPickedFulfillments(scriptContext)
                        break
                    case 'getPackedFulfillments':
                        chartLib.CarouselChart.getPackedFulfillments(scriptContext)
                        break
                    case 'getAverageShippingCost':
                        chartLib.CarouselChart.getAverageShippingCost(scriptContext)
                        break
                    case 'getDailyOrderVolumeItems':
                        chartLib.CarouselChart.getDailyOrderVolumeItems(scriptContext)
                        break
                    case 'getDailyOrderVolumeOrders':
                        chartLib.CarouselChart.getDailyOrderVolumeOrders(scriptContext)
                        break
                    case 'getFulfillThroughputOrdersCreated':
                        chartLib.CarouselChart.getFulfillThroughputOrdersCreated(scriptContext)
                        break
                    case 'getFulfillThroughputOrdersShipped':
                        chartLib.CarouselChart.getFulfillThroughputOrdersShipped(scriptContext)
                        break
                    case 'getPeakHourAnalysisResult':
                        chartLib.CarouselChart.getPeakHourAnalysisResult(scriptContext)
                        break
                    case 'getShippingMethodDistribution':
                        chartLib.CarouselChart.getShippingMethodDistribution(scriptContext)
                        break
                    case 'getFulfillmentOrders':
                        scLib.Search.pendingFulfillmentOrders(scriptContext)
                        break
                    case 'getFulfillmentOrderLines':
                        scLib.Search.pendingFulfillmentOrderLines(scriptContext)
                        break
                    case 'getSubsidiaries':
                        scLib.Search.subsidiaries(scriptContext)
                        break
                    case 'getCustomers':
                        scLib.Search.customers(scriptContext)
                        break
                    case 'getLocations':
                        scLib.Search.locations(scriptContext)
                        break
                    case 'getShippingMethods':
                        scLib.Search.shippingMethods(scriptContext)
                        break
                    case 'fulfillOrder':
                        scLib.Request.fulfillOrder(scriptContext)
                        break
                    case 'generatePackingSlip':
                        scLib.Request.generatePackingSlip(scriptContext)
                        break
                    case 'printPreviewPDF':
                        scLib.Request.printPreviewPDF(scriptContext)
                        break
                    case 'downloadZPLFile':
                        scLib.Request.downloadZPLFile(scriptContext)
                        break
                    case 'downloadPDFFile':
                        scLib.Request.downloadPDFFile(scriptContext)
                        break
                    case 'viewResult':
                        scLib.Request.viewResult(scriptContext)
                        break
                    default:
                        scLib.Request.runApp(scriptContext)
                        break
                }
            } else {
                switch (params.mode) {
                    case 'fulfillOrderLines':
                        scLib.Request.fulfillOrderLines(scriptContext)
                        break
                    case 'generateZPLFile' :
                        scLib.Request.generateZPLFile(scriptContext)
                        break
                }
            }
            log.audit('-------- [END] --------')
        }

        return {onRequest}

    });
