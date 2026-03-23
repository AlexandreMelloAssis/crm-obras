using Microsoft.AspNetCore.Authorization;

namespace CrmObras.Api.Authorization;

public class WorkAuthorizeAttribute : AuthorizeAttribute
{
    public WorkAuthorizeAttribute(string permission)
    {
        Policy = $"{WorkPermissionPolicyProvider.PolicyPrefix}{permission}";
    }
}
