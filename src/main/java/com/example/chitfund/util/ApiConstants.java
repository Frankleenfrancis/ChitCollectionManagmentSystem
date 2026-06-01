package com.example.chitfund.util;

public class ApiConstants {

    private ApiConstants() {

    }

    public static final String CUSTOMER =
            "Customer";

    public static final String CUSTOMER_ALREADY_EXIST =
            "Customer already exists with phone: ";

    public static final String CUSTOMER_EMAIL_ALREADY_EXIST =
            "Customer already exists with email: ";

    public static final String USER_NOT_FOUND =
            "User not found  : ";

    public static final String PHONE_NUMBER_ALREADY_EXIST =
            "Phone number already registered: ";

    public static final String CUSTOMER_NOT_FOUND_PHONE =
            "Customer not found with phone: ";


    //Response
    public static final String CUSTOMER_ADDED =
            "Customer added successfully";

    public static final String CUSTOMER_UPDATED =
            "Customer updated successfully";

    public static final String CUSTOMER_DEACTIVATED =
            "Customer deactivated successfully";

    //chit
    public static final String CHIT_PLAN_ALREADY_EXIST =
            "Chit plan already exists with name: ";

    public static final String CHIT_PLAN =
            "ChitPlan";

    public static final String PLAN_NAME_ALREADY_EXIST =
            "Plan name already exists: ";

    public static final String CHIT_PLAN_CREATED =
            "Chit plan created successfully";

    public static final String CHIT_PLAN_UPDATED =
            "Chit plan updated successfully";

    public static final String PLAN_STATUS_UPDATED_TO =
            "Plan status updated to ";

    //enrollments
    public static final String CANNOT_ENROLL_INACTIVE_PLAN =
            "Cannot enroll in an inactive chit plan";

    public static final String CUSTOMER_ALREADY_EXIST_BY_PLAN =
            "Customer is already enrolled in this chit plan";

    public static final String CHIT_PLAN_REACHED_MAXIMUM =
            "Chit plan has reached its maximum member capacity";

    public static final String ENROLLMENT =
            "Enrollment";

    public static final String ENROLLMENT_ID_NOT_FOUND =
            "Enrollment id not found  :";

    public static final String CANNOT_ADD_INACTIVE_ENROLLMENT =
            "Cannot add collection entry for an inactive enrollment";

    public static final String MONTH_NO_EXCEED_PLAN_DURATION =
            "Month number exceeds plan duration of ";

    public static final String MONTHS =
            "months";

    public static final String COLLECTION_ENTRY_EXISTS_BY_MONTH =
            "Collection entry already exists for month ";

    public static final String COLLECTION_ENTRY =
            "CollectionEntry";

    public static final String CUSTOMER_ID_NOT_FOUND =
            "Customer id not found";

    public static final String CUSTOMER_ID_PENDING_STATUS_NOT_FOUND =
            "Customer ID not found with pending status";

    //payment

    public static final String COLLECTION_ENTRY_BY_ID_NOT_FOUND =
            "Collection Entry by id not found";

    public static final String COLLECTION_ENTRY_FULLY_PAID=
            "This collection entry is already fully paid";

    public static final String PAYMENT_NOT_FOUND_WITH_RECEIPT=
            "Payment not found with receipt: ";

    public static final String PAYMENT_ID_NOT_FOUND=
            "Payment id not found  :";


    public static final String GET_ALL_USERS=
            "Please find All users";

    public static final String CREATE_USER_FOR_CUSTOMER=
            "Created user for Customer Successfully";

    public static final String USER_CREATED=
            "User created successfully";
}

