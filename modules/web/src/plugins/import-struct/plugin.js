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
import Plugin from 'core/plugin/plugin';
import { CONTRIBUTIONS } from 'core/plugin/constants';
import { read } from 'core/workspace/fs-util';
import { COMMANDS as WORKSPACE_COMMANDS } from 'core/workspace/constants';
import DefaultNodeFactory from 'ballerina/model/default-node-factory';
import NodeFactory from 'ballerina/model/node-factory';
import { PLUGIN_ID, DIALOG } from './constants';
import ImportStructDialog from './dialogs/import-struct-dialog';

/**
 * Help plugin.
 *
 * @class HelpPlugin
 */
class ImportStructPlugin extends Plugin {

    /**
     * @inheritdoc
     */
    getID() {
        return PLUGIN_ID;
    }

    /**
     * @inheritdoc
     */
    getContributions() {
        const { DIALOGS } = CONTRIBUTIONS;
        return {
            [DIALOGS]: [
                {
                    id: DIALOG.IMPORT_STRUCT,
                    component: ImportStructDialog,
                    propsProvider: () => {
                        return {
                            importStructPlugin: this,
                            extensions: ['json'],
                        };
                    },
                },
            ],
        };
    }
}

export default ImportStructPlugin;
