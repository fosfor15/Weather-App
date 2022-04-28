export type AmplifyDependentResourcesAttributes = {
    "function": {
        "getCurrentWeather": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "getCurrentWeather": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}