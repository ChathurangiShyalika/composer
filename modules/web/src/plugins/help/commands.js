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

import { COMMANDS } from './constants';

/**
 * Provides command definitions of help plugin.
 * @returns {Object[]} command definitions.
 */
export function getCommandDefinitions(plugin) {
    return [
        {
            id: COMMANDS.OPEN_REFRENCE,
            shortcut: {
                default: 'f1',
            },
        },
        {
            id: COMMANDS.REPORT_ISSUE,
        },
        {
            id: COMMANDS.SHOW_ABOUT,
        },
    ];
}
