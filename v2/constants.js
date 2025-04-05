export const MODEL_TEMPLATE = (className, props) => `
using System;
namespace API.Models 
{
    public class ${className} {
    ${props.map(p => `        public ${p.type} ${p.name} { get; set; }`).join('\n')}
    }
}`;

export const REPOSITORY_TEMPLATE = (className, props) => `
using System.Collections.Generic;
using System.Data.SqlClient;
using API.Models;
using API.Core;

namespace API.Repositories 
{
    public class ${className}Repository 
    {
        public ${className} SetAttributes(SqlDataReader reader) => new ${className} 
        {
        ${props.map(p => { return p.type === 'string' ? `            ${p.name} = reader["${p.name}"].ToString() ?? "",` : `            ${p.name} = (${p.type})reader["${p.name}"],`; }).join('\n')}
        };

        public int Insert(${className} obj) 
        {
            using DB db = new();
            db.NewCommand("INSERT INTO ${className} (${props.map(p => p.name).join(', ')}) VALUES (${props.map(p => '@' + p.name).join(', ')});");
            ${props.map(p => `            db.Parameter("@${p.name}", obj.${p.name});`).join('\n')}
            return db.Execute();
        }

        public int Update(${className} obj) 
        {
            using DB db = new();
            db.NewCommand("UPDATE ${className} SET ${props.map(p => `${p.name}=@${p.name}`).join(', ')} WHERE ${props.map(p => `${p.name}=@${p.name}`).join(' AND ')};");
            ${props.map(p => `            db.Parameter("@${p.name}", obj.${p.name});`).join('\n')}
            return db.Execute();
        }

        public int Delete(${className} obj) 
        {
            using DB db = new();
            db.NewCommand("DELETE FROM ${className} WHERE ${props.map(p => `${p.name}=@${p.name}`).join(' AND ')};");
            ${props.map(p => `            db.Parameter("@${p.name}", obj.${p.name});`).join('\n')}
            return db.Execute();
        }

        public List<${className}> SelectAll() 
        {
            using DB db = new();
            db.NewCommand("SELECT ${props.map(p => p.name).join(', ')} FROM ${className};");
            List<${className}> list = new();
            using SqlDataReader reader = db.Execute();
            while (reader.Read()) {
                list.Add(SetAttributes(reader));
            }
            return list;
        }
    }
}`;

export const SERVICE_TEMPLATE = (className, props) => `
using API.Models;
using API.Repositories;

namespace API.Services 
{
    public class ${className}Service 
    {
        private readonly ${className}Repository _repo = new();

        public int Insert(${className} obj) 
        {
${props.map(p => `            if (obj.${p.name} == null) throw new ArgumentException("${p.name} is required");`).join('\n')}
            return _repo.Insert(obj);
        }

        public int Update(${className} obj) 
        {
${props.map(p => `            if (obj.${p.name} == null) throw new ArgumentException("${p.name} is required");`).join('\n')}
            return _repo.Update(obj);
        }

        public int Delete(${className} obj) => _repo.Delete(obj);
        public List<${className}> GetAll() => _repo.SelectAll();
    }
}`;

export const CONTROLLER_TEMPLATE = (className) => `
using Microsoft.AspNetCore.Mvc;
using API.Models;
using API.Services;

namespace API.Controllers 
{
    [ApiController]
    [Route("api/[controller]")]
    public class ${className}Controller : ControllerBase 
    {
        private readonly ${className}Service _service = new();

        [HttpPost("insert")]
        public IActionResult Insert(${className} obj) => Ok(_service.Insert(obj));

        [HttpPut("update")]
        public IActionResult Update(${className} obj) => Ok(_service.Update(obj));

        [HttpDelete("delete")]
        public IActionResult Delete(${className} obj) => Ok(_service.Delete(obj));

        [HttpGet("read")]
        public IActionResult GetAll() => Ok(_service.GetAll());
    }
}`;

export const DB_TEMPLATE = `
using Microsoft.Data.Sqlite;
using SQLitePCL;
using System.Data;

namespace API.Core;
public class DB : IDisposable
{
    private readonly SqliteConnection cnn = new(Constants.DB._CONNECTION_STRING_);
    public SqliteCommand command { get; private set; } = new();
    public void NewCommand(string query) => command = new(query, cnn);
    public void Parameter(string parameter, dynamic value) => command.Parameters.AddWithValue(parameter, value);
    public void Command(string sql) => command = new(sql, cnn);
    public void Connect()
    {
        try
        {
            Batteries.Init();
            if (cnn != null || cnn?.State == ConnectionState.Closed)
            {
                cnn.Open();
            }
        }
        catch (SqliteException ex)
        {
            Console.WriteLine($"Error connecting to the database: {ex.Message}");
            throw;
        }
    }
    public void Disconnect()
    {
        if (cnn != null && cnn.State != ConnectionState.Closed)
        {
            cnn.Close();
            command.Dispose();
        }
    }
    public dynamic Execute()
    {
        if (cnn?.State == ConnectionState.Closed)
        {
            Connect();
        }
        if (command.CommandText.ToUpper().StartsWith("SELECT"))
        {
            return command.ExecuteReader();
        }
        return command.ExecuteNonQuery();
    }
    public void Dispose()
    {
        Disconnect();
    }
}
`;

export const CONSTANTS_TEMPLATE = `
namespace API.Core
{
    public class Constants
    {
        public class DB
        {
            private const string _HOST_ = "../DB/Beautiful.sqlite";
            public const string _CONNECTION_STRING_ = $"Data Source={_HOST_};";
        }
        public class Token
        {
            public const string _KEY_ = "onerandomkeytworandomkeythreerandomkeyfourrandomkeyfiverandomkeysixrandomkeysevenrandomkey";
            public const long _EXPIRATION_TIME_ = 1440;
        }
    }
}
`;

export const PROPERTIES_TEMPLATE = `
{
  "profiles": {
    "API": {
      "commandName": "Project",
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:7700",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      },
    }
  }
}
`;

export const TOKENSERVICE_TEMPLATE = `
using API.Core;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace API.Services
{
    public class TokenService
    {
        private readonly SymmetricSecurityKey _key;
        public TokenService(IConfiguration config)
        {
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constants.Token._KEY_));
        }
        public string CreateToken(string user)
        {
            List<Claim> claims =
            [
                new Claim(JwtRegisteredClaimNames.NameId, user)
            ];
            SigningCredentials creds = new(_key, SecurityAlgorithms.HmacSha512Signature);
            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(Constants.Token._EXPIRATION_TIME_),
                SigningCredentials = creds
            };
            JwtSecurityTokenHandler tokenHandler = new();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
`;

export const CSPROJ_TEMPLATE = `
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.5" />
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.5" />
    <PackageReference Include="Microsoft.Data.Sqlite.Core" Version="9.0.1" />
    <PackageReference Include="Newtonsoft.Json" Version="13.0.3" />
    <PackageReference Include="SQLitePCLRaw.bundle_e_sqlite3" Version="2.1.10" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
    <PackageReference Include="System.Data.SqlClient" Version="4.8.6" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.5.2" />
  </ItemGroup>
</Project>
`;

export const APISLN_TEMPLATE = `
Microsoft Visual Studio Solution File, Format Version 12.00
# Visual Studio Version 17
VisualStudioVersion = 17.6.33829.357
MinimumVisualStudioVersion = 10.0.40219.1
Project("{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}") = "API", "API.csproj", "{428CA96B-3B2F-4507-9829-0E528654894A}"
EndProject
Global
	GlobalSection(SolutionConfigurationPlatforms) = preSolution
		Debug|Any CPU = Debug|Any CPU
		Release|Any CPU = Release|Any CPU
	EndGlobalSection
	GlobalSection(ProjectConfigurationPlatforms) = postSolution
		{428CA96B-3B2F-4507-9829-0E528654894A}.Debug|Any CPU.ActiveCfg = Debug|Any CPU
		{428CA96B-3B2F-4507-9829-0E528654894A}.Debug|Any CPU.Build.0 = Debug|Any CPU
		{428CA96B-3B2F-4507-9829-0E528654894A}.Release|Any CPU.ActiveCfg = Release|Any CPU
		{428CA96B-3B2F-4507-9829-0E528654894A}.Release|Any CPU.Build.0 = Release|Any CPU
	EndGlobalSection
	GlobalSection(SolutionProperties) = preSolution
		HideSolutionNode = FALSE
	EndGlobalSection
	GlobalSection(ExtensibilityGlobals) = postSolution
		SolutionGuid = {1FE76D93-ACEA-4DA7-A0F6-1C55C2A6883E}
	EndGlobalSection
EndGlobal
`;

export const PROGRAM_TEMPLATE = `
using API;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddServices(builder.Configuration);

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
`;

export const PROGRAMSERVICE_TEMPLATE = `
using API.Core;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace API
{
    public static class ProgramServices
    {
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration config)
        {
            services.AddEndpointsApiExplorer();
            services.AddControllers();
            services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins("*").AllowAnyMethod().AllowAnyHeader()));
            services.AddScoped<TokenService>();
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new()
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Constants.Token._KEY_)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                };
            });

            services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "Basic Crud API", Version = "v1" });
                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                option.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id="Bearer"
                            }
                        },
                        new string[]{}
                    }
                });
            });
            services.AddSingleton<DB>();
            return services;
        }
    }
}
`;