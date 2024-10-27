/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

import * as React from "react";
import { GridProps, TextFieldProps } from "@aws-amplify/ui-react";
export declare type EscapeHatchProps = {
    [elementHierarchy: string]: Record<string, unknown>;
} | null;
export declare type VariantValues = {
    [key: string]: string;
};
export declare type Variant = {
    variantValues: VariantValues;
    overrides: EscapeHatchProps;
};
export declare type ValidationResponse = {
    hasError: boolean;
    errorMessage?: string;
};
export declare type ValidationFunction<T> = (value: T, validationResponse: ValidationResponse) => ValidationResponse | Promise<ValidationResponse>;
export declare type ConversationUpdateFormInputValues = {
    lastMessageTimestamp?: string;
};
export declare type ConversationUpdateFormValidationValues = {
    lastMessageTimestamp?: ValidationFunction<string>;
};
export declare type PrimitiveOverrideProps<T> = Partial<T> & React.DOMAttributes<HTMLDivElement>;
export declare type ConversationUpdateFormOverridesProps = {
    ConversationUpdateFormGrid?: PrimitiveOverrideProps<GridProps>;
    lastMessageTimestamp?: PrimitiveOverrideProps<TextFieldProps>;
} & EscapeHatchProps;
export declare type ConversationUpdateFormProps = React.PropsWithChildren<{
    overrides?: ConversationUpdateFormOverridesProps | undefined | null;
} & {
    id?: string;
    conversation?: any;
    onSubmit?: (fields: ConversationUpdateFormInputValues) => ConversationUpdateFormInputValues;
    onSuccess?: (fields: ConversationUpdateFormInputValues) => void;
    onError?: (fields: ConversationUpdateFormInputValues, errorMessage: string) => void;
    onChange?: (fields: ConversationUpdateFormInputValues) => ConversationUpdateFormInputValues;
    onValidate?: ConversationUpdateFormValidationValues;
} & React.CSSProperties>;
export default function ConversationUpdateForm(props: ConversationUpdateFormProps): React.ReactElement;
