/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import { getPathSeperator } from 'api-client/api-client';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import Dialog from 'core/view/Dialog';
import FileTree from 'core/view/tree-view/FileTree';
import { createOrUpdate, exists as checkFileExists } from 'core/workspace/fs-util';
import { DIALOGS } from 'core/workspace/constants';
import { COMMANDS as LAYOUT_COMMANDS } from 'core/layout/constants';
import ScrollBarsWithContextAPI from 'core/view/scroll-bars/ScrollBarsWithContextAPI';

const FILE_TYPE = 'file';

/**
 * File Save Wizard Dialog
 * @extends React.Component
 */
class ExportDiagramDialog extends React.Component {

    /**
     * @inheritdoc
     */
    constructor(props) {
        super(props);
        this.state = {
            error: '',
            filePath: '',
            fileName: '',
            fileType: '',
            showDialog: true,
        };
        this.onFileSave = this.onFileSave.bind(this);
        this.onDialogHide = this.onDialogHide.bind(this);
    }

    /**
     * Called when user clicks open
     */
    onFileSave() {
        const { filePath, fileName, fileType } = this.state;
        if (fileName.trim() === '') {
            this.setState({
                error: 'File name cannot be empty',
            });
            return;
        }
        if (filePath.trim() === '') {
            this.setState({
                error: 'File path cannot be empty',
            });
            return;
        }
        const derivedFileType = !_.endsWith(fileName, '.svg') && !_.endsWith(fileName, '.png')
            ? (!_.isEmpty(fileType) ? fileType : 'SVG')
            : (_.endsWith(fileName, '.svg') ? 'SVG' : 'PNG');
        const derivedFilePath = !_.endsWith(filePath, getPathSeperator())
            ? filePath + getPathSeperator() : filePath;
        const derivedFileName = !_.endsWith(fileName, '.svg') && !_.endsWith(fileName, '.png')
            ? (`${fileName}.${derivedFileType.toLowerCase()}`)
            : fileName;

        const saveFile = (content) => {
            createOrUpdate(derivedFilePath, derivedFileName, content, true)
                .then((success) => {
                    this.setState({
                        error: '',
                        showDialog: false,
                    });
                    this.props.onSaveSuccess();
                })
                .catch((error) => {
                    this.setState({
                        error: error.message,
                    });
                    this.props.onSaveFail();
                });
        };

        checkFileExists(derivedFilePath + derivedFileName)
            .then(({ exists }) => {
                if (!exists) {
                    this.sendPayload(derivedFilePath, derivedFileName, derivedFileType, saveFile);
                } else {
                    this.props.command.dispatch(LAYOUT_COMMANDS.POPUP_DIALOG, {
                        id: DIALOGS.REPLACE_FILE_CONFIRM,
                        additionalProps: {
                            filePath: derivedFilePath + derivedFileName,
                            onConfirm: () => {
                                this.sendPayload(derivedFilePath, derivedFileName, derivedFileType, saveFile);
                            },
                            onCancel: () => {
                                this.props.onSaveFail();
                            },
                        },
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    error: error.message,
                });
                this.props.onSaveFail();
            });
    }

    /**
     * Called when user hides the dialog
     */
    onDialogHide() {
        this.setState({
            error: '',
            showDialog: false,
        });
    }

    /**
     * Get the diagram SVG to export.
     *
     * @return {string} svg.
     * */
    getSVG() {
        const tab = $('#bal-file-editor-' + this.props.file.id);
        const svgElement = tab.find('.svg-container');
        const svgElementClone = tab.find('.svg-container').clone(true);

        // Create a svg element with actual height and width of the diagram.
        let svg = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" 
                style='fill:rgb(255,255,255);font-family:"Roboto",Arial,Helvetica,sans-serif;
                font-size:14px;' width="${svgElement.width()}" height="${svgElement.height()}">
                <rect style="fill: rgb(255,255,255);fill-opacity: 1;" width="${svgElement.width()}"
                height="${svgElement.height()}" x="0" y="0"></rect>`;

        this.elementIterator(svgElement, svgElementClone);
        svg += svgElementClone.html();
        svg += '</svg>';
        return svg;
    }

    /**
     * allocate style from diagram to exporting html.
     *
     * @param {element} from - element to get the style from.
     * @param {element} to - element to set the style.
     * @return {null} nullable value.
     * */
    styleAllocator(from, to) {
        let computedStyleObject = false;
        // trying to figure out which style object we need to use depense on the browser support
        // so we try until we have one
        if (typeof from !== 'number') {
            computedStyleObject = from.currentStyle || document.defaultView.getComputedStyle(from, null);
        }

        // if the browser dose not support both methods we will return null
        if (!computedStyleObject) return null;

        const stylePropertyValid = function (name, value) {
            // checking that the value is not a undefined
            return typeof value !== 'undefined' &&
                // checking that the value is not a object
                typeof value !== 'object' &&
                // checking that the value is not a function
                typeof value !== 'function' &&
                // checking that we dosent have empty string
                value.length > 0 &&
                // checking that the property is not int index ( happens on some browser
                value !== parseInt(value);
        };

        // we iterating the computed style object and copy the style props and the values
        for (const property in computedStyleObject) {
            // checking if the property and value we get are valid sinse browser have different implementations
            if (stylePropertyValid(property, computedStyleObject[property])) {
                if (this.filterStyleProperties(property)) {
                    if (property === 'width') {
                        to.style[property] = from.width ? ('' + from.width.baseVal.value) : 'auto';
                    } else if (property === 'height') {
                        to.style[property] = from.height ? ('' + from.height.baseVal.value) : 'auto';
                    } else if (property === 'visibility') {
                        if (computedStyleObject[property] === 'hidden') {
                            to.style[property] = computedStyleObject[property];
                        }
                    } else {
                        // applying the style property to the target element
                        to.style[property] = computedStyleObject[property];
                    }
                }
            }
        }

        return null;
    }

    /**
     * filter style properties to be applied to svg.
     *
     * @param {string} property - name of the property.
     * @return {boolean} can apply.
     * */
    filterStyleProperties(property) {
        let canApply = false;
        switch (property) {
            case 'height':
                canApply = true;
                break;
            case 'width':
                canApply = true;
                break;
            case 'fill':
                canApply = true;
                break;
            case 'fillOpacity':
                canApply = true;
                break;
            case 'fillRule':
                canApply = true;
                break;
            case 'marker':
                canApply = true;
                break;
            case 'markerStart':
                canApply = true;
                break;
            case 'markerMid':
                canApply = true;
                break;
            case 'markerEnd':
                canApply = true;
                break;
            case 'stroke':
                canApply = true;
                break;
            case 'strokeDasharray':
                canApply = true;
                break;
            case 'strokeDashoffset':
                canApply = true;
                break;
            case 'strokeLinecap':
                canApply = true;
                break;
            case 'strokeMiterlimit':
                canApply = true;
                break;
            case 'strokeOpacity':
                canApply = true;
                break;
            case 'strokeWidth':
                canApply = true;
                break;
            case 'textRendering':
                canApply = true;
                break;
            case 'textAnchor':
                canApply = true;
                break;
            case 'alignmentBaseline':
                canApply = true;
                break;
            case 'baselineShift':
                canApply = true;
                break;
            case 'dominantBaseline':
                canApply = true;
                break;
            case 'glyph-orientation-horizontal':
                canApply = true;
                break;
            case 'glyph-orientation-vertical':
                canApply = true;
                break;
            case 'kerning':
                canApply = true;
                break;
            case 'stopColor':
                canApply = true;
                break;
            case 'stopOpacity':
                canApply = true;
                break;
            case 'visibility':
                canApply = true;
                break;
            default:
                canApply = false;
                break;
        }
        return canApply;
    }

    /**
     * Iterate through styles.
     *
     * @param {element} svgOri - original svg.
     * @param {element} svgClone - cloned svg.
     * */
    elementIterator(svgOri, svgClone) {
        if (svgOri.children().length !== 0) {
            for (let i = 0; i < svgOri.children().length; i++) {
                this.elementIterator($(svgOri.children()[i]), $(svgClone.children()[i]));
            }
        }
        this.styleAllocator(svgOri[0], svgClone[0]);
        $(svgClone).removeClass();
    }

    /**
     * send the payload to the backend.
     *
     * @param {string} location - location to save the file.
     * @param {string} configName - file name.
     * @param {string} fileType - file type.
     * @param {function} callServer - call back to server.
     * */
    sendPayload(location, configName, fileType, callServer) {
        let payload = '';
        const config = this.getSVG();
        if (fileType === 'SVG') {
            payload = `location=${btoa(location)}&configName=${btoa(configName)}&config=${encodeURIComponent(config)}`;
            callServer(payload);
        } else if (fileType === 'PNG') {
            const tab = $('#bal-file-editor-' + this.props.file.id);
            const svgElement = tab.find('.svg-container');
            const canvas = $(`<canvas width='${svgElement.width()}' height='${svgElement.height()}'/>`)[0];
            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.onload = function load() {
                ctx.drawImage(image, 0, 0);
                const png = canvas.toDataURL('image/png');
                let img = png.replace('data:image/png;base64,', '');
                img = img.replace(' ', '+');
                payload = `location=${btoa(location)}&configName=${btoa(configName)}`
                    + `&imageFile=true&config=${encodeURIComponent(img)}`;
                callServer(payload);
            };
            image.src = 'data:image/svg+xml;charset-utf-8,' + encodeURIComponent(config);
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        return (
            <div>
                <Dialog
                    show={this.state.showDialog}
                    title="Export Diagram"
                    actions={
                        <Button
                            bsStyle="primary"
                            onClick={this.onFileSave}
                            disabled={this.state.filePath === '' && this.state.fileName === ''}
                        >
                            Export
                        </Button>
                    }
                    closeAction
                    onHide={this.onDialogHide}
                    error={this.state.error}
                >
                    <Form horizontal>
                        <FormGroup controlId="filePath">
                            <Col componentClass={ControlLabel} sm={2}>
                                File Path
                            </Col>
                            <Col sm={10}>
                                <FormControl
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            this.onFileSave();
                                        } else if (e.key === 'Escape') {
                                            this.onDialogHide();
                                        }
                                    }}
                                    value={this.state.filePath}
                                    onChange={(evt) => {
                                        this.setState({
                                            error: '',
                                            filePath: evt.target.value,
                                        });
                                    }}
                                    type="text"
                                    placeholder="eg: /home/user/diagrams"
                                />
                            </Col>
                        </FormGroup>
                        <FormGroup controlId="fileName">
                            <Col componentClass={ControlLabel} sm={2}>
                                File Name
                            </Col>
                            <Col sm={7}>
                                <FormControl
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            this.onFileSave();
                                        } else if (e.key === 'Escape') {
                                            this.onDialogHide();
                                        }
                                    }}
                                    value={this.state.fileName}
                                    onChange={(evt) => {
                                        this.setState({
                                            error: '',
                                            fileName: evt.target.value,
                                        });
                                    }}
                                    type="text"
                                    placeholder="eg: routing.png"
                                />
                            </Col>
                            <Col sm={3}>
                                <div className="file-type-selector">
                                    <select
                                        id="fileType"
                                        className="file-type-list btn btn-default"
                                        onChange={(evt) => {
                                            this.setState({
                                                fileType: evt.target.value,
                                            });
                                        }}
                                    >
                                        <option className="file-type-item">SVG</option>
                                        <option className="file-type-item">PNG</option>
                                    </select>
                                </div>
                            </Col>
                        </FormGroup>
                    </Form>
                    <ScrollBarsWithContextAPI
                        style={{
                            margin: '15px 0 15px 40px',
                            width: 608,
                            height: 500,
                        }}
                        autoHide
                    >
                        <FileTree
                            activeKey={this.state.filePath}
                            onSelect={
                                (node) => {
                                    let filePath = node.id;
                                    let fileName = this.state.fileName;
                                    if (node.type === FILE_TYPE) {
                                        filePath = node.filePath;
                                        fileName = node.fileName + '.' + node.extension;
                                    }
                                    this.setState({
                                        error: '',
                                        filePath,
                                        fileName,
                                    });
                                }
                            }
                        />
                    </ScrollBarsWithContextAPI>
                </Dialog>
            </div>
        );
    }
}

ExportDiagramDialog.propTypes = {
    file: PropTypes.objectOf(Object).isRequired,
    onSaveSuccess: PropTypes.func,
    onSaveFail: PropTypes.func,
    command: PropTypes.objectOf(Object).isRequired,
};

ExportDiagramDialog.defaultProps = {
    onSaveSuccess: () => {
    },
    onSaveFail: () => {
    },
};

export default ExportDiagramDialog;
