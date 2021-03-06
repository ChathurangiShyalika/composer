/*
 * Copyright (c) 2017, WSO2 Inc. (http://wso2.com) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.ballerinalang.composer.service.workspace.utils;

import org.ballerinalang.composer.service.workspace.langserver.dto.SymbolInformation;
import org.ballerinalang.composer.service.workspace.langserver.model.ModelPackage;

import java.util.List;
import java.util.Map;

/**
 * BLang program content provider
 */
public class BallerinaProgramContentProvider {
    private static BallerinaProgramContentProvider instance = null;

    public static synchronized BallerinaProgramContentProvider getInstance() {
        if (instance == null) {
            instance = new BallerinaProgramContentProvider();
        }
        return instance;
    }

    /**
     * Returns native types
     * @return JsonArray
     */
    public List<SymbolInformation> builtinTypes() {
        return org.ballerinalang.composer.service.workspace.util.WorkspaceUtils.getBuiltinTypes();
    }

    /**
     * Get All Native Packages.
     *
     * @return {@link Map} Package name, package functions and connectors
     * */
    public Map<String, ModelPackage> getAllPackages() {
        return org.ballerinalang.composer.service.workspace.util.WorkspaceUtils.getAllPackages();
    }
}
