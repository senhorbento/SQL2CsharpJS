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

export const CONTROLLER_TEMPLATE = (className) => `using Microsoft.AspNetCore.Mvc;
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

export const DB_TEMPLATE = () => `
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
`