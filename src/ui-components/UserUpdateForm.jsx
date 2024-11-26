/***************************************************************************
 * The contents of this file were generated with Amplify Studio.           *
 * Please refrain from making any modifications to this file.              *
 * Any changes to this file will be overwritten when running amplify pull. *
 **************************************************************************/

/* eslint-disable */
import * as React from "react";
import {
  Badge,
  Button,
  Divider,
  Flex,
  Grid,
  Icon,
  ScrollView,
  Text,
  TextField,
  useTheme,
} from "@aws-amplify/ui-react";
import { fetchByPath, getOverrideProps, validateField } from "./utils";
import { generateClient } from "aws-amplify/api";
import { getUser } from "../graphql/queries";
import { updateUser } from "../graphql/mutations";
const client = generateClient();
function ArrayField({
  items = [],
  onChange,
  label,
  inputFieldRef,
  children,
  hasError,
  setFieldValue,
  currentFieldValue,
  defaultFieldValue,
  lengthLimit,
  getBadgeText,
  runValidationTasks,
  errorMessage,
}) {
  const labelElement = <Text>{label}</Text>;
  const {
    tokens: {
      components: {
        fieldmessages: { error: errorStyles },
      },
    },
  } = useTheme();
  const [selectedBadgeIndex, setSelectedBadgeIndex] = React.useState();
  const [isEditing, setIsEditing] = React.useState();
  React.useEffect(() => {
    if (isEditing) {
      inputFieldRef?.current?.focus();
    }
  }, [isEditing]);
  const removeItem = async (removeIndex) => {
    const newItems = items.filter((value, index) => index !== removeIndex);
    await onChange(newItems);
    setSelectedBadgeIndex(undefined);
  };
  const addItem = async () => {
    const { hasError } = runValidationTasks();
    if (
      currentFieldValue !== undefined &&
      currentFieldValue !== null &&
      currentFieldValue !== "" &&
      !hasError
    ) {
      const newItems = [...items];
      if (selectedBadgeIndex !== undefined) {
        newItems[selectedBadgeIndex] = currentFieldValue;
        setSelectedBadgeIndex(undefined);
      } else {
        newItems.push(currentFieldValue);
      }
      await onChange(newItems);
      setIsEditing(false);
    }
  };
  const arraySection = (
    <React.Fragment>
      {!!items?.length && (
        <ScrollView height="inherit" width="inherit" maxHeight={"7rem"}>
          {items.map((value, index) => {
            return (
              <Badge
                key={index}
                style={{
                  cursor: "pointer",
                  alignItems: "center",
                  marginRight: 3,
                  marginTop: 3,
                  backgroundColor:
                    index === selectedBadgeIndex ? "#B8CEF9" : "",
                }}
                onClick={() => {
                  setSelectedBadgeIndex(index);
                  setFieldValue(items[index]);
                  setIsEditing(true);
                }}
              >
                {getBadgeText ? getBadgeText(value) : value.toString()}
                <Icon
                  style={{
                    cursor: "pointer",
                    paddingLeft: 3,
                    width: 20,
                    height: 20,
                  }}
                  viewBox={{ width: 20, height: 20 }}
                  paths={[
                    {
                      d: "M10 10l5.09-5.09L10 10l5.09 5.09L10 10zm0 0L4.91 4.91 10 10l-5.09 5.09L10 10z",
                      stroke: "black",
                    },
                  ]}
                  ariaLabel="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeItem(index);
                  }}
                />
              </Badge>
            );
          })}
        </ScrollView>
      )}
      <Divider orientation="horizontal" marginTop={5} />
    </React.Fragment>
  );
  if (lengthLimit !== undefined && items.length >= lengthLimit && !isEditing) {
    return (
      <React.Fragment>
        {labelElement}
        {arraySection}
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      {labelElement}
      {isEditing && children}
      {!isEditing ? (
        <>
          <Button
            onClick={() => {
              setIsEditing(true);
            }}
          >
            Add item
          </Button>
          {errorMessage && hasError && (
            <Text color={errorStyles.color} fontSize={errorStyles.fontSize}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <Flex justifyContent="flex-end">
          {(currentFieldValue || isEditing) && (
            <Button
              children="Cancel"
              type="button"
              size="small"
              onClick={() => {
                setFieldValue(defaultFieldValue);
                setIsEditing(false);
                setSelectedBadgeIndex(undefined);
              }}
            ></Button>
          )}
          <Button size="small" variation="link" onClick={addItem}>
            {selectedBadgeIndex !== undefined ? "Save" : "Add"}
          </Button>
        </Flex>
      )}
      {arraySection}
    </React.Fragment>
  );
}
export default function UserUpdateForm(props) {
  const {
    id: idProp,
    user: userModelProp,
    onSuccess,
    onError,
    onSubmit,
    onValidate,
    onChange,
    overrides,
    ...rest
  } = props;
  const initialValues = {
    nickname: "",
    money: "",
    email: "",
    avatar: "",
    bio: "",
    sold: [],
    totalCarsOwned: "",
    totalAuctionsParticipated: "",
    totalBidsPlaced: "",
    totalSpent: "",
    totalAuctionsWon: "",
    totalProfitEarned: "",
  };
  const [nickname, setNickname] = React.useState(initialValues.nickname);
  const [money, setMoney] = React.useState(initialValues.money);
  const [email, setEmail] = React.useState(initialValues.email);
  const [avatar, setAvatar] = React.useState(initialValues.avatar);
  const [bio, setBio] = React.useState(initialValues.bio);
  const [sold, setSold] = React.useState(initialValues.sold);
  const [totalCarsOwned, setTotalCarsOwned] = React.useState(
    initialValues.totalCarsOwned
  );
  const [totalAuctionsParticipated, setTotalAuctionsParticipated] =
    React.useState(initialValues.totalAuctionsParticipated);
  const [totalBidsPlaced, setTotalBidsPlaced] = React.useState(
    initialValues.totalBidsPlaced
  );
  const [totalSpent, setTotalSpent] = React.useState(initialValues.totalSpent);
  const [totalAuctionsWon, setTotalAuctionsWon] = React.useState(
    initialValues.totalAuctionsWon
  );
  const [totalProfitEarned, setTotalProfitEarned] = React.useState(
    initialValues.totalProfitEarned
  );
  const [errors, setErrors] = React.useState({});
  const resetStateValues = () => {
    const cleanValues = userRecord
      ? { ...initialValues, ...userRecord }
      : initialValues;
    setNickname(cleanValues.nickname);
    setMoney(cleanValues.money);
    setEmail(cleanValues.email);
    setAvatar(cleanValues.avatar);
    setBio(cleanValues.bio);
    setSold(cleanValues.sold ?? []);
    setCurrentSoldValue("");
    setTotalCarsOwned(cleanValues.totalCarsOwned);
    setTotalAuctionsParticipated(cleanValues.totalAuctionsParticipated);
    setTotalBidsPlaced(cleanValues.totalBidsPlaced);
    setTotalSpent(cleanValues.totalSpent);
    setTotalAuctionsWon(cleanValues.totalAuctionsWon);
    setTotalProfitEarned(cleanValues.totalProfitEarned);
    setErrors({});
  };
  const [userRecord, setUserRecord] = React.useState(userModelProp);
  React.useEffect(() => {
    const queryData = async () => {
      const record = idProp
        ? (
            await client.graphql({
              query: getUser.replaceAll("__typename", ""),
              variables: { id: idProp },
            })
          )?.data?.getUser
        : userModelProp;
      setUserRecord(record);
    };
    queryData();
  }, [idProp, userModelProp]);
  React.useEffect(resetStateValues, [userRecord]);
  const [currentSoldValue, setCurrentSoldValue] = React.useState("");
  const soldRef = React.createRef();
  const validations = {
    nickname: [],
    money: [],
    email: [],
    avatar: [],
    bio: [],
    sold: [],
    totalCarsOwned: [],
    totalAuctionsParticipated: [],
    totalBidsPlaced: [],
    totalSpent: [],
    totalAuctionsWon: [],
    totalProfitEarned: [],
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
          nickname: nickname ?? null,
          money: money ?? null,
          email: email ?? null,
          avatar: avatar ?? null,
          bio: bio ?? null,
          sold: sold ?? null,
          totalCarsOwned: totalCarsOwned ?? null,
          totalAuctionsParticipated: totalAuctionsParticipated ?? null,
          totalBidsPlaced: totalBidsPlaced ?? null,
          totalSpent: totalSpent ?? null,
          totalAuctionsWon: totalAuctionsWon ?? null,
          totalProfitEarned: totalProfitEarned ?? null,
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
            query: updateUser.replaceAll("__typename", ""),
            variables: {
              input: {
                id: userRecord.id,
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
      {...getOverrideProps(overrides, "UserUpdateForm")}
      {...rest}
    >
      <TextField
        label="Nickname"
        isRequired={false}
        isReadOnly={false}
        value={nickname}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              nickname: value,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.nickname ?? value;
          }
          if (errors.nickname?.hasError) {
            runValidationTasks("nickname", value);
          }
          setNickname(value);
        }}
        onBlur={() => runValidationTasks("nickname", nickname)}
        errorMessage={errors.nickname?.errorMessage}
        hasError={errors.nickname?.hasError}
        {...getOverrideProps(overrides, "nickname")}
      ></TextField>
      <TextField
        label="Money"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={money}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money: value,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.money ?? value;
          }
          if (errors.money?.hasError) {
            runValidationTasks("money", value);
          }
          setMoney(value);
        }}
        onBlur={() => runValidationTasks("money", money)}
        errorMessage={errors.money?.errorMessage}
        hasError={errors.money?.hasError}
        {...getOverrideProps(overrides, "money")}
      ></TextField>
      <TextField
        label="Email"
        isRequired={false}
        isReadOnly={false}
        value={email}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email: value,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.email ?? value;
          }
          if (errors.email?.hasError) {
            runValidationTasks("email", value);
          }
          setEmail(value);
        }}
        onBlur={() => runValidationTasks("email", email)}
        errorMessage={errors.email?.errorMessage}
        hasError={errors.email?.hasError}
        {...getOverrideProps(overrides, "email")}
      ></TextField>
      <TextField
        label="Avatar"
        isRequired={false}
        isReadOnly={false}
        value={avatar}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar: value,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.avatar ?? value;
          }
          if (errors.avatar?.hasError) {
            runValidationTasks("avatar", value);
          }
          setAvatar(value);
        }}
        onBlur={() => runValidationTasks("avatar", avatar)}
        errorMessage={errors.avatar?.errorMessage}
        hasError={errors.avatar?.hasError}
        {...getOverrideProps(overrides, "avatar")}
      ></TextField>
      <TextField
        label="Bio"
        isRequired={false}
        isReadOnly={false}
        value={bio}
        onChange={(e) => {
          let { value } = e.target;
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio: value,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.bio ?? value;
          }
          if (errors.bio?.hasError) {
            runValidationTasks("bio", value);
          }
          setBio(value);
        }}
        onBlur={() => runValidationTasks("bio", bio)}
        errorMessage={errors.bio?.errorMessage}
        hasError={errors.bio?.hasError}
        {...getOverrideProps(overrides, "bio")}
      ></TextField>
      <ArrayField
        onChange={async (items) => {
          let values = items;
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold: values,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            values = result?.sold ?? values;
          }
          setSold(values);
          setCurrentSoldValue("");
        }}
        currentFieldValue={currentSoldValue}
        label={"Sold"}
        items={sold}
        hasError={errors?.sold?.hasError}
        runValidationTasks={async () =>
          await runValidationTasks("sold", currentSoldValue)
        }
        errorMessage={errors?.sold?.errorMessage}
        setFieldValue={setCurrentSoldValue}
        inputFieldRef={soldRef}
        defaultFieldValue={""}
      >
        <TextField
          label="Sold"
          isRequired={false}
          isReadOnly={false}
          value={currentSoldValue}
          onChange={(e) => {
            let { value } = e.target;
            if (errors.sold?.hasError) {
              runValidationTasks("sold", value);
            }
            setCurrentSoldValue(value);
          }}
          onBlur={() => runValidationTasks("sold", currentSoldValue)}
          errorMessage={errors.sold?.errorMessage}
          hasError={errors.sold?.hasError}
          ref={soldRef}
          labelHidden={true}
          {...getOverrideProps(overrides, "sold")}
        ></TextField>
      </ArrayField>
      <TextField
        label="Total cars owned"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalCarsOwned}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned: value,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.totalCarsOwned ?? value;
          }
          if (errors.totalCarsOwned?.hasError) {
            runValidationTasks("totalCarsOwned", value);
          }
          setTotalCarsOwned(value);
        }}
        onBlur={() => runValidationTasks("totalCarsOwned", totalCarsOwned)}
        errorMessage={errors.totalCarsOwned?.errorMessage}
        hasError={errors.totalCarsOwned?.hasError}
        {...getOverrideProps(overrides, "totalCarsOwned")}
      ></TextField>
      <TextField
        label="Total auctions participated"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalAuctionsParticipated}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated: value,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.totalAuctionsParticipated ?? value;
          }
          if (errors.totalAuctionsParticipated?.hasError) {
            runValidationTasks("totalAuctionsParticipated", value);
          }
          setTotalAuctionsParticipated(value);
        }}
        onBlur={() =>
          runValidationTasks(
            "totalAuctionsParticipated",
            totalAuctionsParticipated
          )
        }
        errorMessage={errors.totalAuctionsParticipated?.errorMessage}
        hasError={errors.totalAuctionsParticipated?.hasError}
        {...getOverrideProps(overrides, "totalAuctionsParticipated")}
      ></TextField>
      <TextField
        label="Total bids placed"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalBidsPlaced}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced: value,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.totalBidsPlaced ?? value;
          }
          if (errors.totalBidsPlaced?.hasError) {
            runValidationTasks("totalBidsPlaced", value);
          }
          setTotalBidsPlaced(value);
        }}
        onBlur={() => runValidationTasks("totalBidsPlaced", totalBidsPlaced)}
        errorMessage={errors.totalBidsPlaced?.errorMessage}
        hasError={errors.totalBidsPlaced?.hasError}
        {...getOverrideProps(overrides, "totalBidsPlaced")}
      ></TextField>
      <TextField
        label="Total spent"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalSpent}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent: value,
              totalAuctionsWon,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.totalSpent ?? value;
          }
          if (errors.totalSpent?.hasError) {
            runValidationTasks("totalSpent", value);
          }
          setTotalSpent(value);
        }}
        onBlur={() => runValidationTasks("totalSpent", totalSpent)}
        errorMessage={errors.totalSpent?.errorMessage}
        hasError={errors.totalSpent?.hasError}
        {...getOverrideProps(overrides, "totalSpent")}
      ></TextField>
      <TextField
        label="Total auctions won"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalAuctionsWon}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon: value,
              totalProfitEarned,
            };
            const result = onChange(modelFields);
            value = result?.totalAuctionsWon ?? value;
          }
          if (errors.totalAuctionsWon?.hasError) {
            runValidationTasks("totalAuctionsWon", value);
          }
          setTotalAuctionsWon(value);
        }}
        onBlur={() => runValidationTasks("totalAuctionsWon", totalAuctionsWon)}
        errorMessage={errors.totalAuctionsWon?.errorMessage}
        hasError={errors.totalAuctionsWon?.hasError}
        {...getOverrideProps(overrides, "totalAuctionsWon")}
      ></TextField>
      <TextField
        label="Total profit earned"
        isRequired={false}
        isReadOnly={false}
        type="number"
        step="any"
        value={totalProfitEarned}
        onChange={(e) => {
          let value = isNaN(parseInt(e.target.value))
            ? e.target.value
            : parseInt(e.target.value);
          if (onChange) {
            const modelFields = {
              nickname,
              money,
              email,
              avatar,
              bio,
              sold,
              totalCarsOwned,
              totalAuctionsParticipated,
              totalBidsPlaced,
              totalSpent,
              totalAuctionsWon,
              totalProfitEarned: value,
            };
            const result = onChange(modelFields);
            value = result?.totalProfitEarned ?? value;
          }
          if (errors.totalProfitEarned?.hasError) {
            runValidationTasks("totalProfitEarned", value);
          }
          setTotalProfitEarned(value);
        }}
        onBlur={() =>
          runValidationTasks("totalProfitEarned", totalProfitEarned)
        }
        errorMessage={errors.totalProfitEarned?.errorMessage}
        hasError={errors.totalProfitEarned?.hasError}
        {...getOverrideProps(overrides, "totalProfitEarned")}
      ></TextField>
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
          isDisabled={!(idProp || userModelProp)}
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
              !(idProp || userModelProp) ||
              Object.values(errors).some((e) => e?.hasError)
            }
            {...getOverrideProps(overrides, "SubmitButton")}
          ></Button>
        </Flex>
      </Flex>
    </Grid>
  );
}
