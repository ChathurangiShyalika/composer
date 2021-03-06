/*
*  Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing,
*  software distributed under the License is distributed on an
*  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
*  KIND, either express or implied.  See the License for the
*  specific language governing permissions and limitations
*  under the License.
*/

package org.ballerinalang.composer.service.workspace.langserver.util.completion.resolvers.parsercontext;

import org.ballerinalang.composer.service.workspace.langserver.SymbolInfo;
import org.ballerinalang.composer.service.workspace.langserver.dto.CompletionItem;
import org.ballerinalang.composer.service.workspace.langserver.util.completion.resolvers.AbstractItemResolver;
import org.ballerinalang.composer.service.workspace.suggetions.SuggestionsFilterDataModel;
import org.wso2.ballerinalang.compiler.parser.antlr4.BallerinaParser;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * assignment statement context resolver for the completion items
 */
public class ParserRuleAssignmentStatementContextResolver extends AbstractItemResolver {
    @Override
    public ArrayList<CompletionItem> resolveItems(SuggestionsFilterDataModel dataModel, ArrayList<SymbolInfo> symbols,
                                                  HashMap<Class, AbstractItemResolver> resolvers) {

        // TODO: left hand side of the assignment statement should analyze when suggesting the completions
        // TODO: at the moment we are using the same completion resolving criteria as the variable definition

        ArrayList<CompletionItem> completionItems = new ArrayList<>();

        completionItems.addAll(resolvers.get(BallerinaParser.VariableDefinitionStatementContext.class)
                .resolveItems(dataModel, symbols, resolvers));

        return completionItems;
    }
}
