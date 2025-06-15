/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define(['N/search', 'N/file'], (search, file) => {

    class PieChart {

        static getOrders(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end } = params
            log.audit('GET_CHARTS_ORDERS_PARAMS', { start, end })
            
            const sos = []
            // [SDT-585] 1.0 Sales Orders Data
            search
                .load({
                    id: 'customsearch_serp_salesorder_data'
                })
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
                .forEach(result => {
                    sos.push({
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        trandate: result.getValue('trandate'),
                        status: result.getValue('statusref'),
                        shippingcost: +result.getValue('shippingcost'),
                    })
                })
            log.audit('GET_CHARTS_ORDERS_RESULT', sos.length)
            response.write(JSON.stringify(sos))
        }

        static getShippingCost(context) {
            const shippingCost = {
                today: 0,
                previous: 0
            }
            // [SDT-585] 1.1 Todays Shipping Cost
            search
                .load({
                    id: 'customsearch_serp_todays_shipping_cost'
                })
                .run()
                .each(result => {
                    shippingCost.today = +result.getValue({
                        name: 'shippingcost',
                        summary: search.Summary.SUM
                    }) || 0
                    return false
                })
            // [SDT-585] 1.2 Previous Shipping Cost
            search
                .load({
                    id: 'customsearch_serp_previous_shipping_cost'
                })
                .run()
                .each(result => {
                    shippingCost.previous = +result.getValue({
                        name: 'shippingcost',
                        summary: search.Summary.SUM
                    }) || 0
                    return false
                })
            log.audit('GET_TODAY_VS_PREV_SHIPCOST_RESULT', shippingCost)
            context.response.write(JSON.stringify(shippingCost))
        }
    }

    class CarouselChart {

        static getOrderFulfillmentCycleTime(context) {
            const ffls = []
            // 	[SDT-585] 2.1.1 Order Fulfillment Cycle Time
            search
                .load({
                    id: 'customsearch_serp_order_ffl_cycle_time'
                })
                .run()
                .each(result => {
                    ffls.push({
                        id: result.getValue({
                            name: 'internalid',
                            summary: search.Summary.GROUP
                        }),
                        sotranId: result.getValue({
                            name: 'tranid',
                            join: 'createdFrom',
                            summary: search.Summary.GROUP
                        }),
                        sotranDate: result.getValue({
                            name: 'trandate',
                            join: 'createdFrom',
                            summary: search.Summary.GROUP
                        }),
                        systemNoteDate: result.getValue({
                            name: 'date',
                            join: 'systemNotes',
                            summary: search.Summary.MIN
                        }),
                        diffHours: +result.getValue(result.columns[4]) || 0
                    })
                    return true
                })
            log.audit('GET_ORDER_FFL_CYCLE_TIME_RESULT', ffls.length)
            context.response.write(JSON.stringify(ffls))
        }

        static getPickedFulfillments(context) {
            const ffls = []

            // [SDT-585] 2.3.1 Picking Efficiency - Items Picked per Hour
            search
                .load({
                    id: 'customsearch_serp_picking_efficiency'
                })
                .run()
                .each(result => {
                    ffls.push({
                        id: result.getValue({
                            name: 'internalid',
                            summary: search.Summary.GROUP
                        }),
                        tranId: result.getValue({
                            name: 'tranid',
                            summary: search.Summary.GROUP
                        }),
                        tranDate: result.getValue({
                            name: 'trandate',
                            summary: search.Summary.GROUP
                        }),
                        systemNoteDate: result.getValue({
                            name: 'date',
                            join: 'systemNotes',
                            summary: search.Summary.MIN
                        }),
                        diffHours: +result.getValue(result.columns[4]) || 0,
                        itemsCount: +result.getValue({
                            name: 'item',
                            summary: search.Summary.COUNT
                        }),
                        get itemsPerHour() {
                            return this.itemsCount ? this.itemsCount / this.diffHours : 0
                        }
                    })
                    return true
                })
            log.audit('GET_FFLS_PICKED_RESULT', ffls.length)
            context.response.write(JSON.stringify(ffls))
        }

        static getPackedFulfillments(context) {
            const ffls = []

            // [SDT-585] 2.4.1 Packing Efficiency - Items Packed per Hour
            search
                .load({
                    id: 'customsearch_serp_packing_efficiency'
                })
                .run()
                .each(result => {
                    ffls.push({
                        id: result.getValue({
                            name: 'internalid',
                            summary: search.Summary.GROUP
                        }),
                        tranId: result.getValue({
                            name: 'tranid',
                            summary: search.Summary.GROUP
                        }),
                        tranDate: result.getValue({
                            name: 'trandate',
                            summary: search.Summary.GROUP
                        }),
                        systemNoteDate: result.getValue({
                            name: 'date',
                            join: 'systemNotes',
                            summary: search.Summary.MIN
                        }),
                        diffHours: +result.getValue(result.columns[4]) || 0,
                        itemsCount: +result.getValue({
                            name: 'item',
                            summary: search.Summary.COUNT
                        }),
                        get itemsPerHour() {
                            return this.itemsCount ? this.itemsCount / this.diffHours : 0
                        }
                    })
                    return true
                })
            log.audit('GET_FFLS_PACKED_RESULT', ffls.length)
            context.response.write(JSON.stringify(ffls))
        }

        static getAverageShippingCost(context) {
            const ffls = []
            // [SDT-585] 2.5.0 Average Shipping Cost per Order
            search
                .load({
                    id: 'customsearch_serp_avg_shipcost_per_order'
                })
                .run()
                .each(result => {
                    ffls.push({
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        trandate: result.getValue('trandate'),
                        sotranId: result.getValue({
                            name: 'tranid',
                            join: 'createdFrom'
                        }),
                        sotranDate: result.getValue({
                            name: 'trandate',
                            join: 'createdFrom'
                        }),
                        shippingcost: +result.getValue('shippingcost'),
                    })
                    return true
                })
            log.audit('GET_AVG_SHIPCOST', ffls/* .length */)
            context.response.write(JSON.stringify(ffls))
        }

        static getDailyOrderVolumeItems(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end } = params
            log.audit('GET_DAILY_ORDER_ITEMS_PARAMS', { start, end })
            
            const items = []
            // [SDT-585] 2.6.1 Daily Order Volume (Items)
            search
                .load({
                    id: 'customsearch_serp_daily_order_vol_items'
                })
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
                .forEach(result => {
                    items.push({
                        id: result.id,
                        itemid: result.getValue('itemid')
                    })
                })
            log.audit('GET_DAILY_ORDER_ITEMS_RESULT', items.length)
            response.write(JSON.stringify(items))
        }

        static getDailyOrderVolumeOrders(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end, startdate, enddate, items } = params
            log.audit('GET_DAILY_ORDER_TRANS_PARAMS', { start, end, startdate, enddate, items })
            
            const tranLines = []
            // [SDT-585] 2.6.2 Daily Order Volume (Orders)
            const searchObj = search.load({
                id: 'customsearch_serp_daily_order_vol_orders'
            })
            searchObj.filters.push(search.createFilter({
                name: 'datecreated',
                operator: search.Operator.WITHIN,
                values: [startdate, enddate]
            }))
            if ((items || '').length) {
                searchObj.filters.push(search.createFilter({
                    name: 'item',
                    operator: search.Operator.ANYOF,
                    values: items.split(',')
                }))
            }
            searchObj
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
                .forEach(result => {
                    tranLines.push({
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        dateCreated: result.getValue('datecreated'),
                        item: {
                            id: result.getValue('item'),
                            itemid: result.getText('item'),
                            quantity: +result.getValue('quantityuom')
                        }
                    })
                })
            log.audit('GET_DAILY_ORDER_TRANS_RESULT', tranLines.length)
            response.write(JSON.stringify(tranLines))
        }

        static getFulfillThroughputOrdersCreated(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end } = params
            log.audit('GET_FFL_THROUGHPUT_ORDERS_PARAMS', { start, end })
            
            const sos = []
            // [SDT-585] 2.7.1 Fulfillment Throughput (SO)
            search
                .load({
                    id: 'customsearch_serp_ffl_throughput_so'
                })
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
                .forEach(result => {
                    sos.push({
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        dateCreated: result.getValue('datecreated'),
                        status: result.getValue('statusref'),
                    })
                })
            log.audit('GET_FFL_THROUGHPUT_ORDERS_RESULT', sos.length)
            response.write(JSON.stringify(sos))
        }

        static getFulfillThroughputOrdersShipped(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end } = params
            log.audit('GET_FFL_THROUGHPUT_SHIPPED_PARAMS', { start, end })
            
            const ffls = []
            // [SDT-585] 2.7.2 Fulfillment Throughput (IF)
            search
                .load({
                    id: 'customsearch_serp_ffl_throughput_if'
                })
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
                .forEach(result => {
                    ffls.push({
                        id: result.getValue({
                            name: 'internalid',
                            summary: search.Summary.GROUP
                        }),
                        sotranId: result.getValue({
                            name: 'tranid',
                            join: 'createdFrom',
                            summary: search.Summary.GROUP
                        }),
                        sotranDate: result.getValue({
                            name: 'trandate',
                            join: 'createdFrom',
                            summary: search.Summary.GROUP
                        }),
                        systemNoteDate: result.getValue({
                            name: 'date',
                            join: 'systemNotes',
                            summary: search.Summary.MIN
                        }),
                        diffHours: +result.getValue(result.columns[4]) || 0
                    })
                })
            log.audit('GET_FFL_THROUGHPUT_SHIPPED_RESULT', ffls.length)
            response.write(JSON.stringify(ffls))
        }

        static getPeakHourAnalysisResult(context) {
            const { request, response } = context
            const params = request.parameters
            const { startdate, enddate } = params
            log.audit('GET_FFL_PEAK_HOURS_ANALYSIS', { startdate, enddate })

            const ffls = []

            // [SDT-585] 2.8.0 Peak Hour Analysis
            const searchObj = search.load({
                id: 'customsearch_serp_peak_hour_analysis'
            })
            searchObj.filters.push(search.createFilter({
                name: 'datecreated',
                operator: search.Operator.WITHIN,
                values: [startdate, enddate]
            }))
            searchObj
                .run()
                .each(result => {
                    ffls.push({
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        dateCreated: result.getValue('datecreated'),
                    })
                    return true
                })
            log.audit('GET_FFL_PEAK_HOURS_ANALYSIS_RESULT', ffls/* .length */)
            response.write(JSON.stringify(ffls))
        }

        static getShippingMethodDistribution(context) {
            const { request, response } = context
            const params = request.parameters
            const { startdate, enddate } = params
            log.audit('GET_SHIPPING_METHOD_DISTRIBUTION_PARAMS', { startdate, enddate })
            const shipMethods = []

            // [SDT-585] 2.9.0 Shipping Method Distribution
            const searchObj = search.load({
                id: 'customsearch_serp_shipping_distribution'
            })
            searchObj.filters.push(search.createFilter({
                name: 'trandate',
                operator: search.Operator.WITHIN,
                values: [startdate, enddate]
            }))
            searchObj
                .run()
                .each(result => {
                    shipMethods.push({
                        shipMethod: result.getText({
                            name: 'shipmethod',
                            summary: search.Summary.GROUP
                        }),
                        id: result.getValue({
                            name: 'internalid',
                            summary: search.Summary.COUNT
                        }),
                        trandate: result.getValue({
                            name: 'trandate',
                            summary: search.Summary.GROUP
                        })
                    })
                    return true
                })
            log.audit('GET_SHIPPING_METHOD_DISTRIBUTION_RESULT', shipMethods)
            response.write(JSON.stringify(shipMethods))
        }
    }

    return { PieChart, CarouselChart }
})