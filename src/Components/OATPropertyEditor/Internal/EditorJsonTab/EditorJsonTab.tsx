import React, { useMemo } from 'react';
import {
    IEditorJsonTabProps,
    IEditorJsonTabStyleProps,
    IEditorJsonTabStyles
} from './EditorJsonTab.types';
import { getStyles } from './EditorJsonTab.styles';
import { classNamesFunction, styled } from '@fluentui/react';
import { useExtendedTheme } from '../../../../Models/Hooks/useExtendedTheme';
import JSONEditor from '../JSONEditor';
import {
    isDTDLModel,
    isDTDLRelationshipReference
} from '../../../../Models/Services/DtdlUtils';

const getClassNames = classNamesFunction<
    IEditorJsonTabStyleProps,
    IEditorJsonTabStyles
>();

const EditorJsonTab: React.FC<IEditorJsonTabProps> = (props) => {
    const { selectedItem, selectedThemeName, styles } = props;

    const isSupportedModelType = useMemo(
        () =>
            isDTDLModel(selectedItem) ||
            isDTDLRelationshipReference(selectedItem),
        [selectedItem]
    );

    // contexts

    // state

    // hooks

    // callbacks

    // side effects

    // styles
    const classNames = getClassNames(styles, {
        theme: useExtendedTheme()
    });

    return (
        <div className={classNames.root}>
            {isSupportedModelType && <JSONEditor theme={selectedThemeName} />}
        </div>
    );
};

export default styled<
    IEditorJsonTabProps,
    IEditorJsonTabStyleProps,
    IEditorJsonTabStyles
>(EditorJsonTab, getStyles);
