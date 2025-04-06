/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Button,
  Flex,
  Grid,
  SwitchField,
  TextField,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getConversation } from "../graphql/queries";
import { updateConversation } from "../graphql/mutations";
const client = generateClient();
export default function ConversationUpdateForm(props) {
  const {
    id: idProp,
    conversation: conversationModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    name: "",
    lastMessageAt: "",
    lastMessageContent: "",
    lastMessageSenderId: "",
    isGroup: false,
  };
  const [name, setName] = React.useState(initialValues.name);
  const [lastMessageAt, setLastMessageAt] = React.useState(
    initialValues.lastMessageAt
  );
  const [lastMessageContent, setLastMessageContent] = React.useState(
    initialValues.lastMessageContent
  );
  const [lastMessageSenderId, setLastMessageSenderId] = React.useState(
    initialValues.lastMessageSenderId
  );
  const [isGroup, setIsGroup] = React.useState(initialValues.isGroup);
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = conversationRecord
      ? { ...initialValues, ...conversationRecord }
      : initialValues;
    setName(cleanValues.name);
    setLastMessageAt(cleanValues.lastMessageAt);
    setLastMessageContent(cleanValues.lastMessageContent);
    setLastMessageSenderId(cleanValues.lastMessageSenderId);
    setIsGroup(cleanValues.isGroup);
    setErrors({});
  };
  const [conversationRecord, setConversationRecord] = React.useState(
    conversationModelProp
  );
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getConversation.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getConversation
        : conversationModelProp;
      setConversationRecord(record);
    };
    queryData();
  }, [idProp, conversationModelProp]);
  React.useEffect(resetStateValues, [conversationRecord]);
  const validations = {
    name: [],
    lastMessageAt: [],
    lastMessageContent: [],
    lastMessageSenderId: [],
    isGroup: [],
  };
  const runValidationTasks = async (
    fieldName,
    currentValue,
    getDisplayValue
  ) => {
    const value =
      currentValue && getDisplayValue
        ? getDisplayValue(currentValue)
        : currentValue;
    let validationResponse = validateField(value, validations[fieldName]);
    const customValidator = fetchByPath(onValidate, fieldName);
    if (customValidator) {
      validationResponse = await customValidator(value, validationResponse);
    }
    setErrors((errors) => ({ ...errors, [fieldName]: validationResponse }));
    return validationResponse;
  };
  return (
    <Grid
      as="form"
      rowGap="15px"
      columnGap="15px"
      padding="20px"
      onSubmit={async (event) => {
        event.preventDefault();
        let modelFields = {
          name: name ?? null,
          lastMessageAt: lastMessageAt ?? null,
          lastMessageContent: lastMessageContent ?? null,
          lastMessageSenderId: lastMessageSenderId ?? null,
          isGroup: isGroup ?? null,
        };
        const validationResponses = await Promise.all(
          Object.keys(validations).reduce((promises, fieldName) => {
            if (Array.isArray(modelFields[fieldName])) {
              promises.push(
                ...modelFields[fieldName].map((item) =>
                  runValidationTasks(fieldName, item)
                )
              );
              return promises;
            }
            promises.push(
              runValidationTasks(fieldName, modelFields[fieldName])
            );
            return promises;
          }, [])
        );
        if (validationResponses.some((r) => r.hasError)) {
          return;
        }
        if (onSubmit) {
          modelFields = onSubmit(modelFields);
        }
        try {
          Object.entries(modelFields).forEach(([key, value]) => {
            if (typeof value === "string" && value === "") {
              modelFields[key] = null;
            }
          });
          await client.graphql({
            query: updateConversation.replaceAll("__typename", ""),
            variables: {
              input: {
                id: conversationRecord.id,
                ...modelFields,
              },
            },
          });
          if (onSuccess) {
            onSuccess(modelFields);
          }
        } catch (err) {
          if (onError) {
            const messages = err.errors.map((e) => e.message).join("\n");
            onError(modelFields, messages);
          }
        }
      }}
      {...getOverrideProps(overrides, "ConversationUpdateForm")}
      {...rest}
    >
      <TextField
        label="Name"
        isRequired={false}
        isReadOnly={false}
        value={name}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name: value,
              lastMessageAt,
              lastMessageContent,
              lastMessageSenderId,
              isGroup,
            };
            const result = onChange(modelFields);
            value = result?.name ?? value;
          }
          if (errors.name?.hasError) {
            runValidationTasks("name", value);
          }
          setName(value);
        }}
        onBlur={() => runValidationTasks("name", name)}
        errorMessage={errors.name?.errorMessage}
        hasError={errors.name?.hasError}
        {...getOverrideProps(overrides, "name")}
      ></TextField>
      <TextField
        label="Last message at"
        isRequired={false}
        isReadOnly={false}
        value={lastMessageAt}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              lastMessageAt: value,
              lastMessageContent,
              lastMessageSenderId,
              isGroup,
            };
            const result = onChange(modelFields);
            value = result?.lastMessageAt ?? value;
          }
          if (errors.lastMessageAt?.hasError) {
            runValidationTasks("lastMessageAt", value);
          }
          setLastMessageAt(value);
        }}
        onBlur={() => runValidationTasks("lastMessageAt", lastMessageAt)}
        errorMessage={errors.lastMessageAt?.errorMessage}
        hasError={errors.lastMessageAt?.hasError}
        {...getOverrideProps(overrides, "lastMessageAt")}
      ></TextField>
      <TextField
        label="Last message content"
        isRequired={false}
        isReadOnly={false}
        value={lastMessageContent}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              lastMessageAt,
              lastMessageContent: value,
              lastMessageSenderId,
              isGroup,
            };
            const result = onChange(modelFields);
            value = result?.lastMessageContent ?? value;
          }
          if (errors.lastMessageContent?.hasError) {
            runValidationTasks("lastMessageContent", value);
          }
          setLastMessageContent(value);
        }}
        onBlur={() =>
          runValidationTasks("lastMessageContent", lastMessageContent)
        }
        errorMessage={errors.lastMessageContent?.errorMessage}
        hasError={errors.lastMessageContent?.hasError}
        {...getOverrideProps(overrides, "lastMessageContent")}
      ></TextField>
      <TextField
        label="Last message sender id"
        isRequired={false}
        isReadOnly={false}
        value={lastMessageSenderId}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              name,
              lastMessageAt,
              lastMessageContent,
              lastMessageSenderId: value,
              isGroup,
            };
            const result = onChange(modelFields);
            value = result?.lastMessageSenderId ?? value;
          }
          if (errors.lastMessageSenderId?.hasError) {
            runValidationTasks("lastMessageSenderId", value);
          }
          setLastMessageSenderId(value);
        }}
        onBlur={() =>
          runValidationTasks("lastMessageSenderId", lastMessageSenderId)
        }
        errorMessage={errors.lastMessageSenderId?.errorMessage}
        hasError={errors.lastMessageSenderId?.hasError}
        {...getOverrideProps(overrides, "lastMessageSenderId")}
      ></TextField>
      <SwitchField
        label="Is group"
        defaultChecked={false}
        isDisabled={false}
        isChecked={isGroup}
        onChange={(e) => {
          let value = e.target.checked;
          if (onChange) {
            const modelFields = {
              name,
              lastMessageAt,
              lastMessageContent,
              lastMessageSenderId,
              isGroup: value,
            };
            const result = onChange(modelFields);
            value = result?.isGroup ?? value;
          }
          if (errors.isGroup?.hasError) {
            runValidationTasks("isGroup", value);
          }
          setIsGroup(value);
        }}
        onBlur={() => runValidationTasks("isGroup", isGroup)}
        errorMessage={errors.isGroup?.errorMessage}
        hasError={errors.isGroup?.hasError}
        {...getOverrideProps(overrides, "isGroup")}
      ></SwitchField>
      <Flex
        justifyContent="space-between"
        {...getOverrideProps(overrides, "CTAFlex")}
      >
        <Button
          children="Reset"
          type="reset"
          onClick={(event) => {
            event.preventDefault();
            resetStateValues();
          }}
          isDisabled={!(idProp || conversationModelProp)}
          {...getOverrideProps(overrides, "ResetButton")}
        ></Button>
        <Flex
          gap="15px"
          {...getOverrideProps(overrides, "RightAlignCTASubFlex")}
        >
          <Button
            children="Submit"
            type="submit"
            variation="primary"
            isDisabled={
              !(idProp || conversationModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
