import React, {
    createContext,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useMemo,
    useReducer
} from 'react';
import BaseComponent from '../BaseComponent/BaseComponent';
import './ValueRangeBuilder.scss';
import { ActionButton } from '@fluentui/react';
import { createGUID } from '../../Models/Services/Utils';
import {
    IValueRangeBuilderContext,
    IValueRangeBuilderProps,
    ValueRangeBuilderActionType,
    IValueRangeBuilderHandle
} from './ValueRangeBuilder.types';
import {
    getValidationMapFromValueRanges,
    areDistinctValueRangesValid,
    getNextColor,
    isRangeOverlapFound
} from './ValueRangeBuilder.utils';
import {
    defaultValueRangeBuilderState,
    valueRangeBuilderReducer
} from './ValueRangeBuilder.state';
import { useTranslation } from 'react-i18next';
import ValueRangeValidationError from './Internal/ValueRangeValidationError';
import ValueRangeRow from './Internal/ValueRangeRow';

export const ValueRangeBuilderContext = createContext<IValueRangeBuilderContext>(
    null
);

const ValueRangeBuilder: React.ForwardRefRenderFunction<
    IValueRangeBuilderHandle,
    IValueRangeBuilderProps
> = (
    {
        initialValueRanges = [],
        customSwatchColors,
        baseComponentProps,
        setAreRangesValid,
        minRanges = 0,
        maxRanges
    },
    forwardedRef
) => {
    const { t } = useTranslation();

    const initialValidationMap = useMemo(
        () => getValidationMapFromValueRanges(initialValueRanges),
        [initialValueRanges]
    );

    const [state, dispatch] = useReducer(valueRangeBuilderReducer, {
        ...defaultValueRangeBuilderState,
        valueRanges: initialValueRanges.sort(
            (a, b) => Number(a.min) - Number(b.min)
        ),
        validationMap: initialValidationMap,
        ...(customSwatchColors && { colorSwatch: customSwatchColors }),
        minRanges,
        maxRanges
    });

    const { validationMap } = state;

    // Update consumer when validation map changes
    useEffect(() => {
        if (typeof setAreRangesValid === 'function') {
            const areDistinctRangesValid = areDistinctValueRangesValid(
                state.validationMap
            );
            const isOverlapDetected = isRangeOverlapFound(
                state.valueRanges,
                state.validationMap
            );

            const areRangesValid = areDistinctRangesValid && !isOverlapDetected;
            setAreRangesValid(areRangesValid);
        }
    }, [state.validationMap]);

    useImperativeHandle(forwardedRef, () => ({
        getValueRanges: () => {
            return state.valueRanges.map((vr) => ({
                ...vr,
                min: Number(vr.min),
                max: Number(vr.max)
            }));
        }
    }));

    return (
        <ValueRangeBuilderContext.Provider
            value={{
                state,
                dispatch
            }}
        >
            <BaseComponent
                {...baseComponentProps}
                containerClassName="cb-value-range-builder-container"
            >
                {state.valueRanges.map((valueRange) => (
                    <div
                        className="cb-value-range-and-messaging-row-container"
                        key={valueRange.id}
                    >
                        <ValueRangeRow valueRange={valueRange} />
                        <ValueRangeValidationError valueRange={valueRange} />
                    </div>
                ))}
                {areDistinctValueRangesValid(validationMap) &&
                    validationMap.overlapFound && (
                        <div className="cb-value-range-validation-error">
                            {t('valueRangeBuilder.overlapDetectedMessage')}
                        </div>
                    )}
                <ActionButton
                    iconProps={{ iconName: 'Add' }}
                    onClick={() => {
                        const id = createGUID(false);

                        dispatch({
                            type: ValueRangeBuilderActionType.ADD_VALUE_RANGE,
                            payload: {
                                id,
                                color: getNextColor(
                                    state.valueRanges,
                                    state.colorSwatch
                                )
                            }
                        });
                    }}
                    ariaLabel={t('valueRangeBuilder.addValueRangeButtonText')}
                    disabled={
                        maxRanges && state.valueRanges.length >= maxRanges
                    }
                >
                    {t('valueRangeBuilder.addValueRangeButtonText')}
                </ActionButton>
            </BaseComponent>
        </ValueRangeBuilderContext.Provider>
    );
};

export default forwardRef(ValueRangeBuilder);