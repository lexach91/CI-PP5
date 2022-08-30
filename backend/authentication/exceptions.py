from rest_framework.views import exception_handler


def status_code_handler(exc, context):
    response = exception_handler(exc, context)
    # print(response)

    if (
        response is not None and
        response.status_code == 403 and
        (
            response.data["detail"] == "No access token" or
            response.data["detail"] == "Invalid access token" or
            response.data["detail"] == "User not found"
        )
    ):
        response.status_code = 401

    return response
