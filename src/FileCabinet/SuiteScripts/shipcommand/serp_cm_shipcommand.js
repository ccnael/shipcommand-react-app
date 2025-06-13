/**
 * @NApiVersion 2.1
 * @NModuleScope Public
 */
define([
    'N/runtime', 
    'N/search', 
    'N/record', 
    'N/render', 
    'N/https', 
    'N/file', 
    'N/url',
    'N/redirect',
    'N/config',
    './lib/moment.min',
    './lib/SERP_LIB_Timebomb'
],

(runtime, search, record, render, https, file, url, redirect, config, moment, timebombLib)  => {

    class Request {

        static runApp(scriptContext) {
            const script = runtime.getCurrentScript()
            const { id: scriptId, deploymentId } = script
            const suiteletUrl = url.resolveScript({ deploymentId, scriptId })
            const template = file.load('./bundle/index.html')
            const js = file.load('./bundle/app.js')
            const css = file.load('./bundle/assets/index.css')
            const downloadPDF = script.getParameter({ name: 'custscript_packing_slip_download_pdf' })
            const pdfOnly = script.getParameter({ name: 'custscript_packing_slip_pdf_only' })
            const itemsPerPage = script.getParameter({ name: 'custscript_items_per_page' }) || 10
            const isValidLicense = timebombLib.isValidLicense({
                accountId: runtime.accountId,
                appId: 'F294A398-502A-4F8E-8A92-10571C7B2197',
                doNotCache: true
            })
            const isPickPackShipEnabled = runtime.isFeatureInEffect({ feature: 'pickpackship' })

            const htmlStr = template.getContents()
                .replace('<script type="module" crossorigin src="/app.js">', `<script type="module" crossorigin src="${js.url}">`)
                .replace('<link rel="stylesheet" crossorigin href="/assets/index.css">', `<link rel="stylesheet" crossorigin href="${css.url}">`)
                .replace('{{suiteletUrl}}', encodeURIComponent(suiteletUrl))
                .replace('{{downloadPDF}}', downloadPDF)
                .replace('{{pdfOnly}}', pdfOnly)
                .replace('{{itemsPerPage}}', itemsPerPage)
                .replace('{{isValidLicense}}', isValidLicense)
                .replace('{{isPickPackShipEnabled}}', isPickPackShipEnabled)
                
            scriptContext.response.write(htmlStr)
        }

        static fulfillOrder(context) {
            const { request, response } = context
            const params = request.parameters
            const id = params.id
            log.audit('FULFILLING_ORDER_ID', id)
    
            try {
                const fflRec = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: id,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true
                })
                fflRec.setValue({ fieldId: 'shipstatus', value: 'C' }) // Shipped

                // Needs to be unchecked in SB as its throwing 'Authentication Failed' error 
                if (runtime.envType === runtime.EnvType.SANDBOX) {
                    fflRec.setValue({ fieldId: 'generateintegratedshipperlabel', value: false })
                }
                const hasIntegratedLabel = fflRec.getValue({ fieldId: 'generateintegratedshipperlabel' })
                const shipMethod = fflRec.getText({ fieldId: 'shipmethod' })
                const fflId = fflRec.save({ ignoreMandatoryFields: true })
                log.audit('FULFILLMENT_SUCCESS', { fflId, shipMethod, hasIntegratedLabel })
    
                response.write(JSON.stringify({
                    ok: true,
                    hasIntegratedLabel,
                    shipMethod,
                    fflId
                }))
            } catch (e) {
                log.error('FULFILLMENT_ERROR', e.message)
                response.write(JSON.stringify({
                    errorMsg: e.message
                }))
            }
        }

        static fulfillOrderLines(context) {
            const { request, response } = context
            const params = request.parameters
            const id = params.id
            const requestBody = request.body || '{}'
            const selectedLines = JSON.parse(requestBody)
            log.audit('FULFILLING_ORDER_LINES_PARAMS', { id, selectedLines })

            try {
                const fflRec = record.transform({
                    fromType: record.Type.SALES_ORDER,
                    fromId: id,
                    toType: record.Type.ITEM_FULFILLMENT,
                    isDynamic: true
                })
                fflRec.setValue({ fieldId: 'shipstatus', value: 'C' }) // Shipped

                // Needs to be unchecked in SB as its throwing 'Authentication Failed' error 
                if (runtime.envType === runtime.EnvType.SANDBOX) {
                    fflRec.setValue({ fieldId: 'generateintegratedshipperlabel', value: false })
                }
                const hasIntegratedLabel = fflRec.getValue({ fieldId: 'generateintegratedshipperlabel' })
                const shipMethod = fflRec.getText({ fieldId: 'shipmethod' })
                fflRec.setValue({ fieldId: 'shipstatus', value: 'C' }) // Shipped
                const lineCount = fflRec.getLineCount({ sublistId: 'item' })
                
                // Unapply items first
                for (let i = 0; i < lineCount; i++) {
                    fflRec.selectLine({
                        sublistId: 'item',
                        line: i
                    })
                    fflRec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemreceive',
                        value: false
                    })
                    fflRec.commitLine({
                        sublistId: 'item'
                    })
                }

                // Apply selected lines
                selectedLines.map(map => {
                    const index = fflRec.findSublistLineWithValue({
                        sublistId: 'item',
                        fieldId: 'orderline',
                        value: map.lineId
                    })
                    if (index > -1) {
                        fflRec.selectLine({
                            sublistId: 'item',
                            line: index
                        })
                        fflRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemreceive',
                            value: false
                        })
                        fflRec.setCurrentSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            value: map.quantity
                        })
                        fflRec.commitLine({
                            sublistId: 'item'
                        })
                    }
                })
                
                const fflId = fflRec.save({ ignoreMandatoryFields: true })
                log.audit('FULFILLMENT_LINES_SUCCESS', { fflId, shipMethod, hasIntegratedLabel })
    
                response.write(JSON.stringify({
                    ok: true,
                    hasIntegratedLabel,
                    shipMethod,
                    fflId
                }))
            } catch (e) {
                log.error('FULFILLMENT_ERROR', e.message)
                response.write(JSON.stringify({
                    errorMsg: e.message
                }))
            }
        }
        
        static generatePackingSlip(context) {
            const { request, response } = context
            const params = request.parameters
            const type = record.Type.ITEM_FULFILLMENT
            const id = params.id
            log.debug('Generating ZPL Packing Slip ZPL Data', id)
            const packSlipZplData = ZPL.packingSlipData(id)
    
            record.submitFields({
                type, id,
                values: { custbody_packslip_zpl_data: packSlipZplData },
                options: { ignoreMandatoryFields: true }
            })
            
            response.write(JSON.stringify({
                ok: true,
                zplData: packSlipZplData
            }))
        }

        static generateZPLFile(context) {
            const { request, response } = context
            const params = request.parameters
            const type = record.Type.ITEM_FULFILLMENT
            const { id, tranId } = params
            const labelZplData = request.body
            log.debug('GENERATING_ZPL_DATA_PARAMS', params)
            
            const packSlipZplData = ZPL.packingSlipData(id)
            const labelZplFileIds = ZPL.labelData(labelZplData, id)
            
            record.submitFields({
                type, id,
                values: {
                    custbody_label_zpl_data: labelZplData,
                    custbody_label_zpl_image_file_ids: labelZplFileIds.join(', '),
                    custbody_packslip_zpl_data: packSlipZplData
                },
                options: { ignoreMandatoryFields: true }
            })
    
            response.write(JSON.stringify({
                ok: true,
                fileIds: labelZplFileIds
            }))
        }

        static printPreviewPDF(context) {
            const { request, response } = context
            const params = request.parameters
            const ids = params.ids.split(',')
            const ffls = Search.itemFulfillments(ids)
            const pdfFile = Utils.generatePDFFile(ffls)
            response.writeFile(pdfFile, true)
        }

        static downloadZPLFile(context) {
            const { request, response } = context
            const params = request.parameters
            const ids = params.ids.split(',')
            const ffls = Search.itemFulfillments(ids)
            const zplFile = ZPL.generateSummaryZPLFile(ffls)
            response.writeFile(zplFile, false)
        }

        static downloadPDFFile(context) {
            const { request, response } = context
            const params = request.parameters
            const ids = params.ids.split(',')
            const ffls = Search.itemFulfillments(ids)
            const pdfFile = Utils.generatePDFFile(ffls)
            response.writeFile(pdfFile, false)
        }

        static viewResult(context) {
            const params = context.request.parameters
            const ids = (params.ids || '').split(',')
            log.audit('FFL_IDS', ids)

            redirect.toSearchResult({
                Search: search.create({
                    type: "itemfulfillment",
                    settings:[{"name":"consolidationtype","value":"ACCTTYPE"}],
                    filters:
                    [
                       ["type","anyof","ItemShip"], 
                       "AND", 
                       ["mainline","is","T"], 
                       "AND", 
                       ["internalid","anyof",ids]
                    ],
                    columns:
                    [
                        search.createColumn({name: "type", label: "Type"}),
                        search.createColumn({name: "tranid", label: "Document Number"}),
                        search.createColumn({name: "status", label: "Status"}),
                        search.createColumn({name: "mainname", label: "Main Line Name"}),
                        search.createColumn({name: "trandate", label: "Date"}),
                        search.createColumn({
                                name: "shipmethod",
                                join: "createdFrom",
                                label: "Ship Via"
                            }),
                        search.createColumn({
                            name: "tranid",
                            join: "createdFrom",
                            label: "SO #"
                        }),
                        search.createColumn({
                            name: "status",
                            join: "createdFrom",
                            label: "SO Status"
                        }),
                        search.createColumn({
                            name: "location",
                            join: "createdFrom",
                            label: "Location"
                        })
                    ]
                })
            })
        }
    }

    // Generate PDF files for printing
    // -----------------------------------------------
    class ZPL {

        static packingSlipData(id) {
            const script = runtime.getCurrentScript()
            const fileId = script.getParameter({ name: 'custscript_zpl_packing_slip_template' })
            let template = file.load(fileId).getContents()
            
            const ffls = Search.itemFulfillments([id])
            const ffl = ffls[0]
            const so = ffl.so
    
            const map = {
                'so_shipaddressee': ffl.so.shipaddressee,
                'so_shipaddress1': so.shipaddress1,
                'so_shipcity': so.shipcity,
                'so_shipzip': so.shipzip,
                'so_shipcountry': /* so.shipcountry */'United States',
                'so_tranid': so.tranid,
                'ffl_tranid': ffl.tranid,
                'ffl_trandate': moment(ffl.trandate).format('MM/DD/YYYY'),
                'ffl_shipmethod': ffl.shipmethod,
                'so_linkedtrackingnumbers': '',//so.linkedtrackingnumbers,
                'so_shipphone': so.shipphone,
                'headerRow': '',
                'so_items': '',
                ...Utils.companyConfig()
            }
    
            const trackNums = so.linkedtrackingnumbers.split('<BR>')
    
            let zplTnRow = 470, zplItemHeaderRow = 520, zplItemRow = 550
            for (const trackNum of trackNums) {
                map['so_linkedtrackingnumbers'] += `^FO50,${zplTnRow}^FD${trackNum}^FS`
                zplTnRow += 30
                zplItemHeaderRow += 30
                zplItemRow += 30
            }
    
            map.headerRow = zplItemHeaderRow
    
            for (const item of so.item) {
                map['so_items'] += `^FO50,${zplItemRow}^FD${item.item} ^FS\n`
                map['so_items'] += `^FO530,${zplItemRow}^FD${item.quantity}^FS\n`
                zplItemRow += 30
            }
    
            for (const k in map) {
                const regex = new RegExp(`{{${k}}}`, 'g')
                // log.debug('packingSlipData', { k, val: map[k] })
                template = template.replace(regex, map[k])
            }
            return template
        }

        static labelData(labelZplData, id) {
            let labelZplFileIds = [];
            try {
                const script = runtime.getCurrentScript()
                const folderId = script.getParameter({ name: 'custscript_zpl_label_folder' }) || -15
                const headers = {
                    'Accept': 'image/png',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                // UPS ZPL Label is rotated upside down
                /* if (printType === 'upsshippinglabel') {
                    headers['X-Rotation'] = '180';
                } */
                // log.debug('labelZplData', labelZplData)
                const labelZplDataSplit = labelZplData.split('^XA').filter(f => !!f && f != '\n').map(m => '^XA\n' + m)
                for (let i = 0; i < labelZplDataSplit.length; i++) {
                    /* log.debug('Sending request', { 
                        url: `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/`,
                        body: labelZplDataSplit[i]
                     }) */
                    const labelZplResponse = https.post({
                        // url: `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/${i}/`,
                        url: `https://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/`,
                        headers,
                        body: `zpl=${labelZplDataSplit[i]}` 
                    })
                    const fileName = `LABEL ZPL - ${id}${labelZplDataSplit.length > 1 ? ((+i)+1) : ''}.png`
                    const labelZplResponseContent = labelZplResponse.body // Returns base64 encoded string
                    const labelZplFileId = file.create({
                        name: fileName,
                        fileType: file.Type.PNGIMAGE,
                        contents: labelZplResponseContent,
                        encoding: file.Encoding.BASE_64,
                        folder: folderId,
                        isOnline: true
                    }).save()
                    labelZplFileIds.push(labelZplFileId)
                }
            } catch (e) {
                log.error('generateLabelZPL Unexpected Error', e.message)
            }
             // log.debug('LABEL ZPL FILE ID', labelZplFileId)
            return labelZplFileIds
        }

        static generateSummaryZPLFile(ffls) {
            const script = runtime.getCurrentScript()
    
            log.audit('CONSOLIDATED ZPL FILE', {
                length: ffls.length,
                remainingUsage: script.getRemainingUsage()
            })
            // log.audit('ffls', ffls)
            /* file.create({
                name: 'test.txt',
                fileType: file.Type.PLAINTEXT,
                contents: JSON.stringify(ffls),
                folder: -15
            }).save() */
            const zplStr = ffls.reduce((x, y) => x += `${y.packSlipZplData}\n${y.labelZplData}`, '')
            
            return file.create({
                name: 'Consolidated_Packing_Slip_Label_ZPL.zpl',
                fileType: file.Type.PLAINTEXT,
                contents: zplStr,
                folder: -15
            })
        }
    }

    class Search {

        static pendingFulfillmentOrders(context) {
            const { request, response } = context
            const params = request.parameters
            log.audit('PENDING_FFL_ORDERS_FILTER_PARAMS', params)
            
            // SERP Fulfill Orders
            const searchObj = search.load('customsearch_serp_fulfill_orders')
            const filterExp = searchObj.filterExpression
            if (params.tranId) {
                filterExp.push('AND')
                filterExp.push(['tranid', 'contains', params.tranId])
            }
            if (params.customer) {
                filterExp.push('AND');
                filterExp.push(['entity', 'is', params.customer]);
            }
            if (params.shipMethods && params.shipMethods.length) {
                filterExp.push('AND');
                filterExp.push(['shipmethod', 'anyof', params.shipMethods]);
            }
            if (params.dateFrom && params.dateTo) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'within', params.dateFrom, params.dateTo]);
            }
            else if (params.dateFrom) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'onorafter', params.dateFrom]);
            }
            else if (params.dateTo) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'onorbefore', params.dateTo]);
            }
            searchObj.filterExpression = filterExp
            // log.audit('FILTER_EXP', searchObj.filterExpression)

            const sos = []
            searchObj.run().each(result => {
                sos.push({
                    id: result.getValue({ name: 'internalid', summary: 'GROUP' }),
                    tranId: result.getValue({ name: 'tranid', summary: 'GROUP' }),
                    date: result.getValue({ name: 'trandate', summary: 'GROUP' }),
                    subsidiary: {
                        text: result.getText({ name: 'subsidiary', summary: 'GROUP' }),
                        value: result.getValue({ name: 'subsidiary', summary: 'GROUP' }),
                    },
                    customer: {
                        text: result.getText({ name: 'mainname', summary: 'GROUP' }),
                        value: result.getValue({ name: 'mainname', summary: 'GROUP' }),
                    },
                    location: {
                        text: result.getText({ name: 'location', summary: 'GROUP' }),
                        value: result.getValue({ name: 'location', summary: 'GROUP' }),
                    },
                    shipmethod: {
                        text: result.getText({ name: 'shipmethod', summary: 'GROUP' }),
                        value: result.getValue({ name: 'shipmethod', summary: 'GROUP' })
                    },
                    quantity: +result.getValue({ name: 'quantityuom', summary: 'SUM' }),
                    shippingcost: +result.getValue({ name: 'shippingcost', summary: 'SUM' }),
                })
                return true
            })
            log.audit('SO_TRANSACTIONS', sos.length)
            response.write(JSON.stringify(sos))
        }

        static pendingFulfillmentOrderLines(context) {
            const { request, response } = context
            const params = request.parameters
            const { start, end } = params
            log.audit('PENDING_FFL_ORDER_LINES_FILTER_PARAMS', params)
            
            // SERP Fulfill Order Lines
            const searchObj = search.load('customsearch_serp_fulfill_order_lines')
            const filterExp = searchObj.filterExpression
            if (params.tranId) {
                filterExp.push('AND')
                filterExp.push(['tranid', 'contains', params.tranId])
            }
            if (params.customer) {
                filterExp.push('AND');
                filterExp.push(['entity', 'is', params.customer]);
            }
            if (params.shipMethods && params.shipMethods.length) {
                filterExp.push('AND');
                filterExp.push(['shipmethod', 'anyof', params.shipMethods]);
            }
            if (params.dateFrom && params.dateTo) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'within', params.dateFrom, params.dateTo]);
            }
            else if (params.dateFrom) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'onorafter', params.dateFrom]);
            }
            else if (params.dateTo) {
                filterExp.push('AND');
                filterExp.push(['trandate', 'onorbefore', params.dateTo]);
            }
            searchObj.filterExpression = filterExp
            // log.audit('FILTER_EXP', searchObj.filterExpression)
            const searchResult = searchObj
                .run()
                .getRange({
                    start: +start,
                    end: +end
                })
            const lines = searchResult.map(map => ({
                id: map.id,
                tranId: map.getValue('tranid'),
                date: map.getValue('trandate'),
                line: map.getValue('line'),
                item: {
                    text: map.getText('item'),
                    value: map.getValue('item'),
                },
                subsidiary: {
                    text: map.getText('subsidiary'),
                    value: map.getValue('subsidiary'),
                },
                customer: {
                    text: map.getText('mainname'),
                    value: map.getValue('mainname'),
                },
                location: {
                    text: map.getText('location'),
                    value: map.getValue('location'),
                },
                shipmethod: {
                    text: map.getText('shipmethod'),
                    value: map.getValue('shipmethod')
                },
                quantity: +map.getValue('quantityuom'),
                shippingcost: +map.getValue('shippingcost'),
            }))
            log.audit('SO_LINES', lines.length)
            response.write(JSON.stringify(lines))
        }

        static itemFulfillments(ids) {
            const transactionSearchObj = search.create({
                type: 'itemfulfillment',
                filters:
                [
                   ['internalid','anyof',ids], 
                   'AND', 
                   // Showing no results in demodev
                   /* ['mainline','is','F'], 
                   'AND',  */
                   ['taxline','is','F'], 
                   'AND', 
                   ['cogs','is','F']
                ],
                columns:
                [
                    search.createColumn({name: 'tranid', label: 'Document Number'}),
                    search.createColumn({name: 'trandate', label: 'Date'}),
                    search.createColumn({name: 'entity', label: 'Customer'}),
                    search.createColumn({name: 'createdfrom', label: 'Created From'}),
                    search.createColumn({name: 'shipmethod', label: 'Ship Via'}),
                    search.createColumn({name: 'item', label: 'Item'}),
                    search.createColumn({name: 'quantityuom', label: 'Quantity in Transaction Units'}),
                    search.createColumn({name: 'custbody_packslip_zpl_data', label: 'Packing Slip ZPL Data'}),
                    search.createColumn({name: 'custbody_label_zpl_data', label: 'Label ZPL Data'}),
                    search.createColumn({name: 'custbody_label_zpl_image_file_ids', label: 'Label ZPL Image File IDs'})
                ]
            })
            const ffls = []
           transactionSearchObj.run().each(result => {
                let ffl = ffls.find(rec => rec.id == result.id)
                if (ffl) {
                    ffl.item.push({
                        item: result.getText('item'),
                        quantity: result.getValue('quantityuom')
                    })
                } else {
                    ffl = {
                        id: result.id,
                        tranid: result.getValue('tranid'),
                        trandate: result.getValue('trandate'),
                        customer: result.getText('entity'),
                        createdfrom: result.getValue('createdfrom'),
                        shipmethod: result.getText('shipmethod'),
                        item: [
                            {
                                item: result.getText('item'),
                                quantity: result.getValue('quantityuom')
                            }
                        ],
                        packSlipZplData: result.getValue('custbody_packslip_zpl_data'),
                        labelZplData: result.getValue('custbody_label_zpl_data'),
                        labelImgFileIds: result.getValue('custbody_label_zpl_image_file_ids').split(', '),
                        labelImgUrls: [],
                        /* get labelImgUrl() {
                            return this.labelImgFile ? file.load(this.labelImgFile).url : ''
                        }, */
                        so: {}
                    }
                    ffls.push(ffl)
                }
                return true
            })
            // log.audit('printPreviewPDF return', ffls.length)
            let labelImgFileIds = []
            ffls.map(m => { labelImgFileIds = [...labelImgFileIds, ...m.labelImgFileIds] })
            labelImgFileIds = labelImgFileIds.filter(Boolean)
            const soIds = ffls.map(m => m.createdfrom).filter(Boolean)

            this._searchAndMapZPLFileUrls(ffls, labelImgFileIds)
            this._searchAndMapSalesOrders(ffls, soIds)
            return ffls
        }

        static _searchAndMapZPLFileUrls(ffls, ids) {
            if (!!ids.length) {
                search.create({
                    type: 'file',
                    filters: [
                        ['internalid', 'anyof', ids]
                    ],
                    columns: [
                        'url'
                    ]
                }).run().each(each => {
                    const ffl = ffls.find(rec => rec.labelImgFileIds.includes(each.id))
                    if (ffl) {
                        ffl.labelImgUrls.push(each.getValue('url'))
                    }
                    return true
                })
            }
        }
    
        static _searchAndMapSalesOrders(ffls, ids) {
            const sos = []
            const transactionSearchObj = search.create({
                type: 'salesorder',
                filters:
                [
                   ['internalid','anyof',ids], 
                   'AND', 
                   ['mainline','is','F'], 
                   'AND', 
                   ['cogs','is','F'], 
                   'AND', 
                   ['taxline','is','F'], 
                   'AND', 
                   ['shipping','is','F'], 
                   'AND', 
                   ['transactiondiscount','is','F']
                ],
                columns:
                [
                    search.createColumn({name: 'tranid', label: 'Document Number'}),
                    search.createColumn({name: 'shipaddress', label: 'Shipping Address'}),
                    search.createColumn({name: 'shipaddressee', label: 'Shipping Addressee'}),
                    search.createColumn({name: 'shipaddress1', label: 'Shipping Address 1'}),
                    search.createColumn({name: 'shipaddress2', label: 'Shipping Address 2'}),
                    search.createColumn({name: 'shipcity', label: 'Shipping City'}),
                    search.createColumn({name: 'shipzip', label: 'Shipping Zip'}),
                    search.createColumn({name: 'shipcountry', label: 'Shipping Country'}),
                    search.createColumn({name: 'shipphone', label: 'Shipping Phone'}),
                    search.createColumn({name: 'tranid', label: 'Document Number'}),
                    search.createColumn({name: 'trackingnumbers', label: 'Tracking Numbers'}),
                    search.createColumn({name: 'item', label: 'Item'}),
                    search.createColumn({name: 'quantityuom', label: 'Quantity in Transaction Units'}),
                    search.createColumn({name: 'quantityshiprecv', label: 'Quantity Fulfilled/Received'})
                ]
            });
             
           transactionSearchObj.run().each(result => {
                let so = sos.find(rec => rec.id == result.id)
                if (so) {
                    so.item.push({
                        item: result.getText('item'),
                        quantity: result.getValue('quantityshiprecv')
                    })
                } else {
                    so = {
                        id: result.id,
                        shipaddress: result.getValue('shipaddress'),
                        shipaddressee: result.getValue('shipaddressee'),
                        shipaddress1: result.getValue('shipaddress1'),
                        shipaddress2: result.getValue('shipaddress2'),
                        shipcity: result.getValue('shipcity'),
                        shipzip: result.getValue('shipzip'),
                        shipcountry: result.getValue('shipcountry'),
                        shipphone: result.getValue('shipphone'),
                        tranid: result.getValue('tranid'),
                        linkedtrackingnumbers: result.getValue('trackingnumbers'),
                        item: [
                            {
                                item: result.getText('item'),
                                quantity: result.getValue('quantityshiprecv')
                            }
                        ]
                    }
                    sos.push(so)
                }
                // Map SO to IF
                const ffl = ffls.find(rec => rec.createdfrom == so.id)
                if (ffl) {
                    ffl.so = so
                }
                return true
            })
        }

        static subsidiaries(context) {
            const subsidiaries = []
            search.create({
                type: 'subsidiary',
                columns: ['name']
            }).run().each(result => {
                subsidiaries.push({
                    text: result.getValue('name').split(' : ').pop(),
                    value: result.id
                })
                return true
            })
            context.response.write(JSON.stringify(subsidiaries))
        }

        static customers(context) {
            const customers = []
            search.create({
                type: 'customer',
                columns: [
                    'companyname',
                    'firstname',
                    'lastname'
                ]
            }).run().each(result => {
                customers.push({
                    text: result.getValue('companyname') || 
                        `${result.getValue('firstname')} ${result.getValue('lastname')}`,
                    value: result.id
                })
                return true
            })
            context.response.write(JSON.stringify(customers))
        }

        static locations(context) {
            const { request, response } = context
            const params = request.parameters
            const subsidiaryId = params.subsidiaryId
            const locations = []
            search.create({
                type: 'location',
                filters: [
                    ['subsidiary', 'is', subsidiaryId]
                ],
                columns: [
                    'name', 
                    'subsidiary'
                ]
            }).run().each(result => {
                locations.push({
                    text: result.getValue('name'),
                    value: result.id,
                    subsidiary_display: result.getValue('subsidiary') // Displays text
                })
                return true
            })
            response.write(JSON.stringify(locations))
        }
        
        static shippingMethods(context) {
            const shipMethods = []
            const filters = [
                [
                    ['itemid', 'contains', 'FedEx'],
                    'OR',
                    ['itemid', 'contains', 'UPS'],
                    'OR',
                    ['itemid', 'contains', 'USPS']
                ]
            ]
            /* if (runtime.envType === runtime.EnvType.PRODUCTION) {
                filters.push(['isshipperintegrated', 'is', 'T'])
            } */
            if (!runtime.accountId.match(/td|tstdrv|sb/gi)) {
                filters.push(
                    'AND',
                    ['isshipperintegrated', 'is', 'T']
                )
            }
            search.create({
                type: 'shipitem',
                filters,
                columns: [
                    search.createColumn({
                        name: 'itemid',
                        label: 'Name'
                    }),
                    search.createColumn({
                        name: 'isshipperintegrated',
                        label: 'Is Integrated Shipping Item'
                    }),
                    search.createColumn({
                        name: 'isreturnserviceintegrated',
                        label: 'Is Return Service Integrated'
                    })
                ]
            }).run().each(result => {
                shipMethods.push({
                    text: result.getValue('itemid'),
                    value: result.id
                })
                return true
            })
            context.response.write(JSON.stringify(shipMethods))
        }
    }

    class Utils {

        static suiteletURL() {
            const script = runtime.getCurrentScript()
            return url.resolveScript({
                deploymentId: script.deploymentId,
                scriptId: script.id
            })
        }

        static generatePDFFile(ffls) {
            const script = runtime.getCurrentScript()
            const fflPDFTemplate = script.getParameter({ name: 'custscript_packing_slip_pdf_template' })
                 
            log.audit('GENERATING_PDF_FILE', {
                length: ffls.length,
                remainingUsage: script.getRemainingUsage()
            })
    
            const renderer = render.create();
            renderer.setTemplateById(fflPDFTemplate);
            renderer.addCustomDataSource({
                format: render.DataSource.JSON,
                alias: 'record',
                data: JSON.stringify({
                    ifmts: ffls
                })
                .replace(/&/g, '&amp;')
                .replace(/<BR>/gi, '<br/>')
            })
            
            const pdfFile = renderer.renderAsPdf()
            pdfFile.name = `Consolidated_Packing_Slip_Label_${moment().format('DDMMYYYY_HHmm')}.pdf`
            return pdfFile
        }

        static companyConfig() {
            const rec = config.load({ type: config.Type.COMPANY_INFORMATION })
            const subRecord = rec.getSubrecord({ fieldId: 'mainaddress' });
            const result = {}
            result.company_name = rec.getValue({ fieldId: 'companyname' })
            result.company_addressee = subRecord.getValue({ fieldId: 'addressee' })
            // result.company_attention = subRecord.getValue({ fieldId: 'attention' })
            result.company_address1 = subRecord.getValue({ fieldId: 'addr1' })
            result.company_address2 = subRecord.getValue({ fieldId: 'addr2' })
            // result.company_city = subRecord.getValue({ fieldId: 'city' })
            result.company_country = subRecord.getValue({ fieldId: 'country' })
            log.audit('COMPANY_CONFIG', result)
            return result
        }
    }

    return { Request, Search }

});
