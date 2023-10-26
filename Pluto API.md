# PlutoApp API

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.15.

## Development server

Run `npm install` and then `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Staging server: ``http://ec2-18-216-78-140.us-east-2.compute.amazonaws.com``<br>
IP: ``18.216.78.140``
WebSocketURL: `18.189.134.39:8082/`
WebSocketToken: `931b73c59d7e0c089c0`
<br>

###Index

<ul>
	<li>1 - 4 Authentionation</li>
	<li>5 - 11 User Management</li>
	<li>12 - 16 Groups Management</li>
	<li>17 - 21 Object Type Management (also check #33 for list)</li>
	<li>22 - 26 Relationships</li>
	<li>27 - 33 Attributes Management</li>
	<li>34, 36, 42, 44 Model Management</li>
	<li>35 - 45 Model Viewer</li>
</ul>
<hr>

# API CALL DETAILS

## 1. Login: POST /api/login

When username provided, behind scenes also check for email login too, so we can login with both username and email

Request

```
	{
		email: 'email',
		password: 'some password'
	}	
```

Response On Success

```
	{
	  status: true|false;
	  user: {
	  	name : "John Doe",
	  	login_key: "Special token string generated on a server side",
	  	is_publication_viewer: true|false
	  },
	  error : ""
	}	
```

Response On Failure

```
	{
		status: false,
		error: "Error string from the server"
	}	
```


## 2. Forgot Password: POST /api/forgot/password

On success, we send out an email with instructions to the user's provided email. The link should be in this format<br>
{HOST}/auth/reset-password/{password_recover_token}

Request

```
	{
		email: <string>
	}	
```

Response On Success

```
	{
	  status: true;
	  error : ""
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 3. Reset Password: POST /api/reset/password

Request

```
	{
		password: 'some password',
		code: "(the code received from #2)"
	}	
```

Response On Success

```
	{
	  status: true <boolean>,
	  error : ""
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 4. Register: POST /api/register

Request

```
	{
		username: 'John Doe',
		email: 'a@b.com',
		password: '1234'
	}	
```

Response On Success

```
	{
	  status: true,
	  user : {
	  	name: "User Name",
	  	login_key : "1234567890" <special login key generated>
	  },
	  error : ""
	}	
```

Response On Failure

```
	{
		status: false,
		error: "(error string from the server)"
	}	
```
<hr>

## 4.1 Check Invite User Token: POST /api/check/invite/token

Should return `true` if token is valid otherwise `false`.

Request

```
	{
		invite_token: "1234",
	}	
```

Response On Success

```
	{
	  status: true,
	  email: "a@b.com"
	}	
```

Response On Failure

```
	{
		status: false,
		error: "(error string from the server)"
	}	
```
<hr>

## 4.2 Complete Invitation: POST /api/complete/invitation

Once password is saved, we should remove the invitation token from the user account and mark user as regular user so it doesn't appear in Invite User pages.

Request

```
	{
		invite_token: "1234",
		first_name: "John",
		last_name: "Doe",
		password: "1234"
	}	
```

Response On Success

```
	{
	  status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "(error string from the server)"
	}	
```
<hr>


## 5. List Of User: POST /users

Request

```
	{
		login_key: (logged in user token),
		type: "active|invited",
		sort: first_name_asc|first_name_desc|last_name_asc|last_name_desc|email_asc|email_desc|last_login_asc|last_login_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true,
		users: [
			{
				id: 1,
				first_name: "John",
				last_name: "Doe",
				username: "john_doe",
				email: "a@b.com",
				last_login_date: "(d/m/Y H:i format)",
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified model/folder or it's attributes last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 <example of total pages>
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 6. Add User: POST /create/user

Request

```
	{
		form_data: {
			name : "John Doe",
			usenrame: "john_doe"
			email : "a@b.com",
			password : "1234"
		}
		groups: [id1, id2] optional,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		id: 1 "Id of new created user"
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 6.1 Add User: POST /invite/user

Request

```
	{
		email : "a@b.com",
	}	
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 7. Edit User: POST /update/user

Request

```
	{
		login_key: "logged in user token",
		id: 1,
		update_only_name: true|false,
		form_data : {
			first_name: "John",
			last_name: "Doe",
			email: "a@b.com",
			is_administrator: true|false,
		},
		groups: [1, 2] //one or multiple ids (optional)
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 8. Update Password: POST /update/user/password

Request

```
	{
		login_key: (logged in user token)
		id: 1,
		password: "1234", 
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 9. Delete User: POST /delete/user

Request

```
	{
		user_ids: [1, 2] (one or multiple user ids),
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 2 (how may pages remaining, recalculate after deleting)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 10. User Details: POST /user/details

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		user: {
			id: 1,
			first_name: "John",
			last_name: "Doe",
			email: "a@b.com",
			is_administrator: true|false,
			available_groups: [ 
				#All available groups including selected ones
				{
					id: 1,
					name: "Group1"
				},
				{
					id: 2,
					name: "Group2"
				},
				...
			],
			selected_groups: [
				{
					id: 1,
					name: "Group1"
				},
				...
			],
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 11. User Available Groups: POST /user/available/groups

Request

```
	{
		login_key: "logged in user token"
	}	
```

Response On Success

```
	status: true,
	error: "",
	groups: [
		{
			id: 1,
			name: "Group 1",
			users: "4"
		},
		...
	]
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 12. List Of Groups: POST /groups

Request

```
	{
		login_key: "logged in user token",
		sort: name_asc|name_desc|users_asc|users_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 "this could be used for the pagination"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		groups: [
			{
				id: <number> (group id),
				name: <string> (group name)
				group_users: <number> (total amount of users in group),
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified model/folder or it's attributes last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 <total pages>
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 13. Add Group: POST /create/group

Request

```
	{
		name: "Group 1",
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 14. Edit Group: POST /update/group

Request

```
	{
		id: 1,
		name: "Group 1",
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 15. Delete Group: POST /delete/group

Request

```
	{
		group_ids: [1, 2] (one or multiple group ids),
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 10 (total pages remainig after deleting items),
		has_childs: true|false
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 16. Group Details: POST /group/details

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		id: 1,
		name: "Group 1",
		total_users: 4 (total amount of users in group),
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>


#Metamodel Management

## 17. List Of Object Types: POST /object/types

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		object_types: [
			{
				id: 1,
				name: "Object Type 1",
				total_attributes: 4,
				created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 18. Add Object Type: POST /create/object/type

Request

```
	{
		name: "Object Type 1",
		attribute_tabs: [
			{
				name: "tab 1",
				attribute_ids: [1,2,3,4,...]
			},
			...
		],
		shape_type_color: "#1234 string",
		shape_type_text_color: "#1234 string",
		shape_type_border_color: "#1234 string",
		shape_icon: "1234.png|1234 string",
		is_round_corners: true|false,
		imported_shapes: [
			{
				"name": "New Shape",
				"image": "data:image....",
			},
			...
		],
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		page: 4
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 19. Edit Object Type: POST /update/object/type

Request

```
	{
		id: 1,
		login_key: "logged in user token",
		name: "Object type 1",
		shape_type_color: "#1234 string",
		shape_type_text_color: "#1234 string",
		shape_type_border_color: "#1234 string",
		is_round_corners: true|false,
		shape_icon: "1234.png|1234 string",
		attribute_tabs: [
			{
				id: "1", (tab id)
				name: "tab 1",
				attribute_ids: [1,2,3,4,...]
			},
			...
		],
		update_only_name: true|false (if is true we only updating name, otherwise both name and attributes),
		imported_shapes: [
			{
				"id": "1234",
				"name": "New Shape",
				"image": "data:image....",
			},
			...
		], (optional)
		deleted_shape_type_ids: [1,2...] optional
	}	
```

Response On Success

```
	{
		status: true,
		model_id: 1234,
		parent_id: 1234
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
## 20. Delete Object Type: POST /delete/object/type


Request

```
	{
		object_type_ids: [1, 2] (one or multiple object type ids),
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}
```

<hr>
## 21. Object Type Details: POST /object/type/detail

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		object_data: {
			id: 1,
			name: "Object type 1",
			shape_type_color: "#1234",
			shape_type_text_color: "#1234",
			shape_type_border_color: "#1234",
			shape_icon: "123.png|1234",
			is_round_corners: true|false,
			available_attribute_types: [
				{
					id : 1,
					name: "Attribute 1"
				},
				...
			],
			attribute_tabs: [
				{
					id : 1, (tab id)
					name: "Tab 1",
					attribute_ids: [1,2,3...]
				},
				...
			],
			shapes: [
				{
					id: "1",
					name: "icon.png",
					image: "data:image/png;base64...",
				},
				...
			],
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>



## 22. List Of Relationship Types: POST /relationship/types

Request

```
	{
		login_key: "logged in user token",
		sort: 'name_asc|name_desc|from_to_asc|from_to_desc|to_from_asc|to_from_desc'|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 "this could be used for the pagination"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		relationship_types: [
			{
				id: 1,
				name: "Relationship 1",
				from_to_description: "From A",
				to_from_description: "To B",
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified model/folder or it's attributes last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 <total pages>
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 23. Add Relationship Type: POST /create/relationship/type

The `from_object_type_id` and `to_object_type_id` in combinations besides the ID can be just `any` which is hardcoded string we need to save in collection. 

Request

```
	{
		login_key: "logged in user token",
		form_data: {
			name: "Relationship1",
			from_to_description: "From A",
			to_from_description: "To B",
			bi_directional_relationship: true|false,
			start_line: "line1", (can be null too),
			end_line: "line2", (can be null too)
		],
		combinations: [
			{
				from_object_type_id: "1",
				to_object_type_id: "2",
				description: "Some description",
				containment: "from_to|to_from|both" (can be null too)
			},
			...
		],
		attribute_tabs: [
			{
				name: "tab 1",
				attribute_ids: [1,2,3,4,...]
			},
			...
		],
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 24. Update Relationship Type: POST /update/relationship/type

The `from_object_type_id` and `to_object_type_id` in combinations besides the ID can be just `any` which is hardcoded string we need to save in collection. 

Request

```
	{
		login_key: "logged in user token",
		update_only_name: true|false,
		form_data: {
			id: 'relationship type id',
			name: "Relationship1",
			from_to_description: "From A",
			to_from_description: "To B",
			bi_directional_relationship: true|false,
			start_line: "line1" (can be null too),
			end_line: "line2" (can be null too)
		],
		combinations: [
			{
				id: "either number for update or empty assuming new one"
				from_object_type_id: "1",
				to_object_type_id: "2",
				description: "Some description",
				containment: "from_to|to_from|both" (can be null too)
			},
			...
		],
		attribute_tabs: [
			{
				id: "1", (tab id, optional)
				name: "tab 1",
				attribute_ids: [1,2,3,4,...]
			},
			...
		],
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 25. Relationship Type Details: POST /relationship/type/details

Notes: If `any` has been selected for combinations, the `id` needs to be `any` and name `ANY`.

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		relationship_data: {
			id: "1",
			name: "Relationship type 1",
			from_to_description: "from A",
			to_from_description: "from B",
			bi_directional_relationship: true|false,
			start_line: "line1", (can be null too),
			end_line: "line2", (can be null too),
			combinations: [
				{
					id: 1,
					description: "some description",
					from_object_type: {
						id : "2",
						name: "From A"
					},
					to_object_type: {
						id : "2",
						name: "To B"
					},
					containment: "from_to|to_from|both" (can be null too)
				},
				...
			],
			available_attribute_types: [
				{
					id: 1,
					name: "Attribute Type 1",
				},
				{
					id: 2,
					name: "Attribute Type 2",
				},
				...
			],
			attribute_tabs: [
				{
					id: 1,
					name: "Tab 1",
					attribute_ids: [1,2,3,...],
				},
				...
			]
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 26. Delete Relationship Type: DELETE /delete/relationship/type

Request

```
	{
		ids: [1, 2] (one or multiple relationship type ids)
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1 (pages after delete)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 26.1 List Of Metamodel Items: POST /metamodels

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|default_asc|default|desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		metamodels: [
			{
				id: 1,
				name: "Metamodel 1",
				default: true|false,
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified the record",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 26.2 Delete Metamodel: POST /delete/metamodel

Request

```
	{
		metamodel_ids: [1, 2] (one or multiple metamodel ids),
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 26.3. Metamodel Details: POST /metamodel/detail

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		metamodel_data: {
			id: 1,
			name: "Object type 1",
			default: true|false,
			available_object_types: [
				{
					id : 1,
					name: "Object Type 1"
				},
				...
			],
			selected_object_types: [
				{
					id : 1,
					name: "Object Type 1"
				},
				...
			],
			available_relationship_types: [
				{
					id : 1,
					name: "Relationship Type 1"
				},
				...
			],
			selected_relationship_types: [
				{
					id : 1,
					name: "Relationship Type 1"
				},
				...
			],
			available_diagram_types: [
				{
					id : 1,
					name: "Diagram Type 1"
				},
				...
			],
			selected_diagram_types: [
				{
					id : 1,
					name: "Diagram Type 1"
				},
				...
			],
			
			
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 26.4. Edit Metamodel: POST /update/metamodel

Request

```
	{
		id: 1,
		login_key: "logged in user token",
		name: "Object type 1",
		default: true|false,
		object_type_ids: [1,2], (can be empty array too),
		relationship_type_ids: [1,2], (can be empty array too),
		diagram_type_ids: [1,2], (can be empty array too),
		update_only_name: true|false (if is true we only updating name, otherwise both name and other items in request)
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>




## Attribute Types

Notes: Each attribute type might have different formats.<br>
- Text<br>
- Date<br>
- Decimal<br>
- Integer<br>
- List <br>
- Multi-Select List<br>
- Booelan <br>

<B>Help Guide</b><br>

`attribute_type` table is going to have following fields<br>
- id<br>
- name <br>
- format_type <enum from above items <br>

This means we need multiple tables to link with<br>
`attribute_items` where we store date, decimal, integer, and text, boolean<br>
`attribute_list_item` where we store list items<br>

Good approach is having all types separated with unique tables but this is going to make performance a bit slower. Full list attribute keys are <br>

`text`, `date`, `integer`, `decimal`, `boolean`, `list`, `multiple-list`


## 27. List Of Attribute Types: POST /attribute/types

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|format_asc|format_desc|created_date_asc|created_date_desc|created_by_asc|created_by_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 "this could be used for the pagination"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		attribute_types: [
			{
				id: 1,
				name: "Text Attribute"
				format_label: ("Text", "Date", "Date Range", "List", ...),
				export_to_diagram: true|false,
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 <total pages>
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 28. Delete Attribute Types: POST /delete/attribute/type

Request

```
	{
		login_key: "logged in user token",
		attribute_type_ids: [1, 2] array containing one or multiple items
	}	
```

Response On Success

```
	{
		status: true,
		pages: 20, pages after deleting
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 29. Create Attribute Type: POST /attribute/type/create

Request

```
	{
		login_key: "logged in user token",
		form_data: {
			name : "Attribute Type 1",
			query: "some query here",
			format: text|date|date_range|decimal|integer|boolean|list|multiple-list,
			object_type_ids: [1, 2,...] optional one or multiple in array,
			relationship_type_ids: [1,2,...] (optional one or multiple in array),
			list_options : ['item1','item2',...] only when format is ``list`` or ``multiple-list``,
			number_options: {
				from_number: 10, (for decimal is decimal) optional
				to_number: 20, (for decimal is decimal) optional
				currency: 'EUR' (optional),
				decimal_places: 1 (optional and required for decimal type only)
			},
			boolean_options: {
				default : 'true' | 'false' | null (when not selected null is assigned)
			},
			export_to_diagram: true|false,
			
		}
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 30. Get Attribute Details: POST /attribute/type/detail

Request

```
	{
		login_key: "logged in user token",
		id: 1
	}	
```

Response On Success

```
	{
	status: true,
    error: '',
    attribute_data : {
      id: 1,
      name: 'Dummy Attribute',
      query: "some query here",
	  format: text|date|date-range|decimal|integer|boolean|list|multiple-list,
      available_object_types: [
        {
          id: '1',
          name: 'Object Type 1'
        },
        {
          id: '2',
          name: 'Object Type 2'
        },
        {
          id: '3',
          name: 'Object Type 3'
        },
        {
          id: '4',
          name: 'Object Type 4'
        }
      ],
      selected_object_types : [
        {
          id: '1',
          name: 'Object Type 1'
        },
        {
          id: '2',
          name: 'Object Type 2'
        },
        {
          id: '3',
          name: 'Object Type 3'
        },
      ],
      available_relationship_types: [
        {
          id: '1',
          name: 'Relationship Type 1'
        },
      ],
      selected_relationship_types: [
      	{
      		id: '1',
      		name: "Relationship Type 1",
      	},
      	...
      ],
      list_options: [],
      number_options: {
        'from_number' : 10,
        'to_number' : 20,
        'currency' : 'USD',
        'decimal_places' : 1
      },
      boolean_options: {
        'default' : 'true'
      },
      export_to_diagram: true|false
    }
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>



## 31. Update Attribute Type: POST /attribute/type/update

Request

```
	{
		login_key: "logged in user token",
		update_only_name: true|false,
		form_data: {
			id: "1",
			name : "Attribute Type 1",
			query: "some query here",
			format: text|date|date_range|decimal|integer|boolean|list|multiple-list,
			object_type_ids: [1, 2,...] optional one or multiple in array,
			relationship_type_ids: [1,2...] optional one or multiple in array,
			list_options : ['item1','item2',...] only when format is ``list`` or ``multiple-list``,
			number_options: {
				from_number: 10, (for decimal is decimal) optional
				to_number: 20, (for decimal is decimal) optional
				currency: 'EUR' (optional),
				decimal_places: 1 (optional and required for decimal type only)
			},
			boolean_options: {
				default : 'true' | 'false' | null (when not selected null is assigned)
			},
			export_to_diagram: true|false
		}
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 31.1. Update Attribute Export Diagram Flag: POST /attribute/type/export/diagram

Request

```
	{
		id: 1,
		export_to_diagram: true| false
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>



## 32. Get Available Attribute Types List: POST /user/available/attribute/types

Used for Object Type page

Request

```
	{
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		attribute_types: [
			{
				id: 1,
				name: 'Attribute Type 1'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>



## 33. Get Available Object Types List: POST /user/available/object/types

This should return object types list.

Request

```
	{
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		object_types: [
			{
				id: 1,
				name: 'Object Type 1'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 33.1 Get Available Relationship Types List: POST /user/available/relationship/types

This should return relationship types list.

Request

```
	{
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		relationship_types: [
			{
				id: 1,
				name: 'Relationship Type 1'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 33.2 Get Available Diagram Types List: POST /user/available/diagram/types

This should return diagram types list.

Request

```
	{
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagram_types: [
			{
				id: 1,
				name: 'Diagram Type 1'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 33.3. Add Metamodel: POST /create/metamodel

Request

```
	{
		name: "Metamodel 1",
		default: true| false,
		object_type_ids: [1, 2] (can be empty array too),
		diagram_type_ids: [1, 2] (can be empty array too),
		relationship_type_ids: [1, 2] (can be empty array too),
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 33.4. Update Metamodel Flag: POST /update/metamodel/default

Request

```
	{
		id: 1,
		default: true| false
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 33.5. Model Metamodel Defails: POST /model/metamodel/details

Notes: for this API returning the Metamodels list assigned to the selected model.

Request

```
	{
		id: 1 (this is model id)
	}	
```

Response On Success

```
	{
		status: true,
		metamodels: [
			{
				metamodel_id: 1,
				name: "Metamodel 1"
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 33.6. Update model's metamodels: POST /model/metamodel/update

Notes: Only allow a metamodel to be removed if no object type or relationship type assigned to that metamodel exists within model

Request

```
	{
		id: 1 (this is model id),
		metamodel_ids: [1,2,3...]
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>



#Model Management

## 34. Get Model Manager Items: POST /models

Notes: 

1. Each folder can have multiple folders and multiple models. Each model can have multiple folder. Model can't contain other models but only folders.

2. When we have `show_object_diagram` that means besides folders we should show the objects & diagrams too.

3. When we have `publication` we have to lookup for checked items and append inside `items`, this can be at any level we have to expand things before checked items, checked items but not last level. Like we may have A1, A2, A3, A4, A5 as nested and only A2, A3 are checked, this means we have to expand A1 too to show A2, A3 checked but not expand A2 and A3. Need to make it dynamic so it works for any nested level. Each checked items should have `checked:true` attribute.


Request

```
	{
		login_key: "logged in user token",
		options: { //optional
			id: 1,
			type: model or folder (object | diagram when show_object_diagram is set)
		},
		show_object_diagram: false,
		sort: name_asc|name_desc|created_asc|created_desc|updated_asc|updated_desc|created_by_asc|created_by_desc|last_update_by_asc|last_update_by_desc,
		publication_id: 1,
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		items: [
		   {
            id : 1,
            name : 'Root Folder 1',
            type : 'folder',
            created_on: "d/m/Y format date",
            created_by: "created by user name",
            updated_on: "d/m/Y format date",
            last_updated_by: "Another User",
            pages: 5,
            items: [] //add blank array
          },
         {
            id : 4,
            name : 'Root Model 1',
            type : 'model',
            created_on: "d/m/Y format date",
            created_by: "created by user name",
            updated_on: "d/m/Y format date",
            last_updated_by: "Another User",
            is_favorite: true|false,
            pages: 3,
            items : [] //add blank array
          },
		],
		page: 1,
		breadcrumbs: [
			{
				id: 1234,
				name: 'Folder 1'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 35. Get Model Details (Model Viewer): POST /model/details

Note that each model can have multiple objects or no objects from the beginning. For `model_viewer_left_sidebar_width` return this only when the `show` is equal to `details`.  

Important: the `type` is either `object` or `model_folder`. This can be used only when `show` is `items` and we should lookup for an object directory when type is `object`, otherwise old logic remains.

If the `token` presents, we have to look for a token based current expanded items state and loop through items, so it returns nestes folders, objects etc if needed.

Request

```
	{
		login_key: "logged in user token",
		ids: [1, 2] one or multiple model ids or folder|model,
		keyword: 'optional text',
		show: "details|items"
		page: will be sent from server for load data for that page,
		type: object|model_folder,
		token: "1234", (can be null too)
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 100,
		model_viewer_left_sidebar_width: 300,
		models: [
		   {
            id : 1,
            name : 'Model 1',
            type: 'model|folder|object|diagram|view',
            pages: 10,
            has_childs: true|false,
            items: [
            	{	
        		  id : 1,
	            name : 'Item 1',
	            type: 'folder|object|diagram|view',
	            pages: 10,
	            has_childs: true|false,
            	},
            	...
            ],
          },
         	{
            id : 11,
            name : 'Model 2',
            type: 'model|folder|object|diagram|view',
            pages : 1,
            has_childs: true|false,
            items: []
          },
          ...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 36. Create Object POST /create/object



Request

```
	{
		login_key: "logged in user token",
		object_data : {
			name : "Object 1",
			object_type_id: "1"
		},
		options: {
			id: 1, If set 0 then is root level,
			type: model or folder
		}
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		id: 1,
		name: "Object 1",
		pages: 10, page of parent object after adding new item, note that parent can be model and folder as well,
		has_childs: true|false
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 37. Get Object(s) Details POST /object/details



Request

```
	{
		login_key: "logged in user token",
		object_ids: [1, 2], can be one or multiple inside array
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		settings: {
			date_format : "day month year",
			separator: "/"
		},
		object_type_attributes: [
			id : 1 //object N ID,
			name: "Object 1",
			object_type: "Object type 1",
			model_name : "Model 1 (note that model name be at any top level)",
			created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			description: "text",
			tabs: [
				{
					id: 1,
					name: "Tab 1",
					attribute_ids: [1,2,3...]
				},
			],
			attributes: [
				{
                    attribute_id : '1',
                    name : 'Some Text',
                    type : 'text',
                    selected_value : ['Sample of text attribute']
                  },
                  {
                    attribute_id : '2',
                    name : 'Some Date',
                    type : 'date',
                    selected_value : ['2021-04-16']
                  },
                  {
                    attribute_id : '21',
                    name : 'Some Date Range',
                    type : 'date_range',
                    selected_value : ['2021-01-01', '2021-01-02']
                  },
                  {
                    attribute_id : '3',
                    name : 'Some Decimal',
                    type : 'decimal',
                    selected_value : ['4.0'],
                    values : ['1.0','5.0'],
                    currency : 'USD',
                    decimal_spaces : "1"
                  },
                  {
                    attribute_id : '4',
                    name : 'Some Integer',
                    type : 'integer',
                    selected_value : ['5'],
                    values : ['1','10'],
                    currency : 'EUR'
                  },
                  {
                    attribute_id : '5',
                    name : 'Some Boolean',
                    type : 'boolean',
                    selected_value : ['true'],
                  },
                  {
                    attribute_id : '6',
                    name : 'Some List',
                    type : 'list',
                    selected_value : ['Option 2'],
                    values : ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
                  },
                  {
                    attribute_id : '7',
                    name : 'Some Multiple List',
                    type : 'multiple-list',
                    selected_value : ['Multiple 1', 'Multiple 2'],
                    values : ['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'],
                  },
			],
			{
				id : 2 //object N ID,
				name: "Object 1",
				object_type: "Object type 1",
				attributes: [
					...
				],
				tabs: []
			}
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 38.1 Get Object(s) Relationships POST /object/relationship



Request

```
	{
		login_key: "logged in user token",
		object_id: 1,
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 1,
		relationships_data: [
          {
            relationship_id : '1',
            relationship_type_id : '1',
            name : 'Relationship Type From/To Combination Description 1',
            total_objects: "10",
            type: "from|to",
            pages: 1,
          },
          {
            relationship_id : null,
            relationship_type_id : 'navigates_to',
            total_diagrams: 10,
            pages: 1
          },
          ...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 38.2 Get Object(s) Relationships Objects POST /object/relationship/objects



Request

```
	{
		login_key: "logged in user token",
		relationship_type_id: 1,
		relationship_id: 1,
		from_object_id: 1,
		page: 1,
		type: "from|to"
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 1,
		objects_data: [
          {
            id : '1',
            name : 'Object 1',
            type: 'from|to'
          },
          {
            id : '1,
            name : 'Object 2',
            type: 'from|to'
          },
          ...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 38.3 Get Diagrams(s) Relationships Objects POST /object/relationship/diagrams



Request

```
	{
		login_key: "logged in user token",
		object_id: 1,
		page: 1,
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 1,
		diagrams: [
          {
            id : '1',
            name : 'Diagram 1',
            model_id: 1,
          },
          {
            id : '1',
            name : 'Diagram 1',
            model_id: 1,
          },
          ...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 38.4 Get Diagram Relationships POST /diagram/relationships

Notes

1. The relationships_data should return only 1 record for now until we extend it
2. We should return "navigates_from". Note that those are not for objects that exist inside Diagram but objects that that has been created using Add Relationship popup (when we select an object and then diagram and create relationship).


Request

```
	{
		login_key: "logged in user token",
		id: 1, (diagram id)
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 1,
		relationships_data: [
          {
            id: "1234", (diagram id),
            type : 'navigates_from',
            total_objects: "10",
            pages: 1,
          },
          ...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 38.5 Get Diagram Relationships Objects POST /diagram/relationship/objects



Request

```
	{
		login_key: "logged in user token",
		id: 1, (diagram id)
		page: 1,
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		pages: 1,
		objects_data: [
          {
            id : '1',
            name : 'Object 1',
          },
          {
            id : '1,
            name : 'Object 2',
          },
          ...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>




## 39. Update Object Attributes POST /update/object/attributes

Notes: 

1. When attribute is `date_range` the both from/to dates will be included in request and splitted by `__##__`, note that each from/to can be empty too. 
2. If request `type` is `objects` we process object attribute update, otherwise if it's `relationships` then the `ids` include the relationship ids.

Request

```
	{
		login_key: "logged in user token",
		object_attributes : {
			"ids": ["60c502c82918c870de37b69d","12345"],
	 	 	"attributes": [
			   {
			    "attribute_id": "60c502c82918c870de37b69d",
				value : 'text, date, list or any other value
			   },
			   
			   (for multiple-list and date_range the value can be splitted by __##__)
			   ...
			]
		},
		type: "objects|relationships"
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 40. Inline Editor Attribute Details POST /object/inline/details

Note: `model_column_width ` `object_name_column_width ` `width` should come from #57 for that logged in user. If width not found the `160` should be sent by default. If height of object not found the `30` should be sent by default.

When `diagram_id` is set, we should fetch the Diagram XML and look for ObjectID cells, then check which objects exists in this list with their child objects and the rest logic should be done as we sent `object_ids`.

Important: the objects can contain other objects, in that case regardless we selecting a folder, model or object, in case any object has other object then we should return them too.

Request

```
	{
		login_key: "logged in user token",
		object_ids: [1,2], (see notes)
		folder_id: 1, (see notes)
		model_id: 1, (see notes),
		diagram_id: 1,
		view_id: 1,
		page: 1,
		type: `objects|relationships`
	},
	
	only 1 of these 3 can have value object_ids, folder_id, model_id.
	
```

Response On Success (TYPE = `objects`)

```
	{
		status: true,
            error: '',
            pages: 4,
    		  settings: {
					date_format : "day month year",
					separator: "/"
			  },
            has_multiple_model_objects: true|false,
            model_column_width: "100",
            object_name_column_width: "100",
            from_object_column_width: "100",
            relationship_type_column_width: "100",
            to_object_column_width: "100",
            settings: {
					date_format : "day month year",
					separator: "/"
				},
				selected_system_properties: {
					created_date: true|false,
					created_by: true|false,
					updated_date: true|false,
					updated_by: true|false,
					model_name: true|false,
					object_type: true|false,
					description: true|false,
				},
				system_properties_column_width: {
					created_date: 100,
					created_by: 100,
					updated_date: 100,
					updated_by: 100,
					model_name: 100,
					object_type: 100,
					description: 100
				},
            object_attributes: [
              {
                id : '1',
                parent_id : '1234',
                name : 'Object 1',
                object_type : 'Object Type 1',
                model_id: '1',
                parent_id: '1',
                object_type_id: '1',
                model_name: "Model 1",
                row_height: '30',
            		created_date: "Y-m-d H:i:s" (date or empty/null),
					created_by: "user name who created the record",
					updated_by: "user name who modified model/folder or it's attributes last time",
					updated_date: "Y-m-d H:i:s" (date or empty/null),
					description: "text",
                attributes : [
                  {
                    attribute_id: '1',
                    name: 'Some Text',
                    type: 'text',
                    selected_value: 'Sample of text attribute',
                  },
                  {
                    attribute_id: '2',
                    name: 'Some Date',
                    type: 'date',
                    selected_value: '2021-04-16',
                  },
                  {
                    attribute_id: '21',
                    name: 'Some Date Range',
                    type: 'date_range',
                    selected_value: ['2021-04-16','2021-04-17'],
                  },
                  {
                    attribute_id: '3',
                    name: 'Some Decimal',
                    type: 'decimal',
                    selected_value: '4.0',
                    values: ['1.0', '1.5'],
                    currency: 'USD',
                  },
                  {
                    attribute_id: '4',
                    name: 'Some Integer',
                    type: 'integer',
                    selected_value: '5',
                    values: ['1', '2'],
                    currency: 'EUR',
                  },
                  {
                    attribute_id: '5',
                    name: 'Some Boolean',
                    type: 'boolean',
                    selected_value: 'true',
                  },
                  {
                    attribute_id: '6',
                    name: 'Some List',
                    type: 'list',
                    selected_value: 'Option 2',
                    values: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
                  },
                  {
                    attribute_id: '7',
                    name: 'Some Multiple List',
                    type: 'multiple-list',
                    selected_value: ['Multiple 1', 'Multiple 2'],
                    values: ['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'],
                  },
                  {
                    attribute_id: '8',
                    name: 'Another Text 8',
                    type: 'text',
                    selected_value: 'Cool text'
                  },
                  {
                    attribute_id: '9',
                    name: 'Event Date',
                    type: 'date',
                    selected_value: '2021-04-20'
                  },
                ]
              },
              {
                id: '2',
                name: 'Object 2',
                object_type: 'Object Type 2',
                attributes: [
 			 		...
 			 	  ],
              }
            ],
            selected_attributes : [
              {
                attribute_id : '1',
                name : 'Attribute 1',
                selected : true,
                width:50,
              },
              {
                attribute_id : '2',
                name : 'Attribute 2',
                selected : true,
                width:100,
              },
              {
                attribute_id : '9',
                name : 'Attribute 5',
                selected : true,
                width:200,
              },
              {
                attribute_id : '10',
                name : 'Attribute 6',
                selected : true,
                width:300,
              },
              ...
        	]
	}	
```

Response On Success (TYPE = `relationships`). Note that there are 2 type of relationships, object->object and object->diagram

```
	{
		status: true,
            error: '',
            pages: 4,
    		  settings: {
					date_format : "day month year",
					separator: "/"
			  },
            has_multiple_model_objects: true|false,
            model_column_width: "100",
            from_object_column_width: "100",
            relationship_type_column_width: "100",
            to_object_column_width: "100",
            settings: {
					date_format : "day month year",
					separator: "/"
				},
				selected_system_properties: {
					created_date: true|false,
					created_by: true|false,
					updated_date: true|false,
					updated_by: true|false,
					model_name: true|false,
					object_type: true|false,
					description: true|false,
				},
				system_properties_column_width: {
					created_date: 100,
					created_by: 100,
					updated_date: 100,
					updated_by: 100,
					model_name: 100,
					object_type: 100,
					description: 100
				},
            object_attributes: [
              {
                 id : '1', (relationship id)
				   relationship_type_id: 22,
	             relationship_type_name: "Best Relationship",
	             relationship_type_metamodel: "Best Metamodel",
	             from_object_id: 1,
	             from_object_name: "From 1",
	             to_object_id: 2,
	             to_object_name: "To 1",
	             from_object_model_id: 1,
	             to_object_model_id: 2,
                model_name: "Model 1" (from object's model name),
                row_height: '30',
            		created_date: "Y-m-d H:i:s" (relationship create date or empty/null),
					created_by: "user name who created the relationship",
					updated_by: "user name who modified relationship or it's attributes last time",
					updated_date: "Y-m-d H:i:s" (date or empty/null),
					description: "text",
                attributes : [
                  {
                    attribute_id: '1',
                    name: 'Some Text',
                    type: 'text',
                    selected_value: 'Sample of text attribute',
                  },
                  {
                    attribute_id: '2',
                    name: 'Some Date',
                    type: 'date',
                    selected_value: '2021-04-16',
                  },
                  {
                    attribute_id: '21',
                    name: 'Some Date Range',
                    type: 'date_range',
                    selected_value: ['2021-04-16','2021-04-17'],
                  },
                  {
                    attribute_id: '3',
                    name: 'Some Decimal',
                    type: 'decimal',
                    selected_value: '4.0',
                    values: ['1.0', '1.5'],
                    currency: 'USD',
                  },
                  {
                    attribute_id: '4',
                    name: 'Some Integer',
                    type: 'integer',
                    selected_value: '5',
                    values: ['1', '2'],
                    currency: 'EUR',
                  },
                  {
                    attribute_id: '5',
                    name: 'Some Boolean',
                    type: 'boolean',
                    selected_value: 'true',
                  },
                  {
                    attribute_id: '6',
                    name: 'Some List',
                    type: 'list',
                    selected_value: 'Option 2',
                    values: ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
                  },
                  {
                    attribute_id: '7',
                    name: 'Some Multiple List',
                    type: 'multiple-list',
                    selected_value: ['Multiple 1', 'Multiple 2'],
                    values: ['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'],
                  },
                  {
                    attribute_id: '8',
                    name: 'Another Text 8',
                    type: 'text',
                    selected_value: 'Cool text'
                  },
                  {
                    attribute_id: '9',
                    name: 'Event Date',
                    type: 'date',
                    selected_value: '2021-04-20'
                  },
                ]
              },
              
              /**Diagram Relationships*/
              {
              	id : '1', (relationship id)
					relationship_type_id: 'navigates_to',
					relationship_type_name: 'Navigates To',
					object_id: 1,
					object_name: "Best Object",
					diagram_id: 1,
					diagram_name: "Best Diagram",
					model_name: "Best Model", (diagram model name)
					created_date: "Y-m-d H:i:s" (relationship create date or empty/null),
					created_by: "user name who created the relationship",
					updated_by: "user name who modified relationship or it's attributes last time",
					updated_date: "Y-m-d H:i:s" (date or empty/null),
					description: "text",
					attributes: []
              }
              ...
            ],
            selected_attributes : [
              {
                attribute_id : '1',
                name : 'Attribute 1',
                selected : true,
                width:50,
              },
              {
                attribute_id : '2',
                name : 'Attribute 2',
                selected : true,
                width:100,
              },
              {
                attribute_id : '9',
                name : 'Attribute 5',
                selected : true,
                width:200,
              },
              {
                attribute_id : '10',
                name : 'Attribute 6',
                selected : true,
                width:300,
              },
              ...
        	]
	}	
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 41. Update Model Available Attributes (Model Viewer): POST /update/object/available/attributes

Notes: 

1. We will have one of object_ids|folder_id|model_id, similar to In Line Editor API. Received attributes (only in send list, we might have attributes on other pages but we work with request) should be marked as "selected" if found in model objects, folder objects or object(s). All their other attributes will get selected = false
2. If `type` is equal to `objects` we keep the current flow (look for object attributes), if equal to `relationships` we have to lookup for relationships and get those attributes instead.


Request

```
	{
		login_key: "logged in user token",
		type: "objects|relationships",
		object_ids: [1] (array or null containing 1 or multiple object ids)
		folder_id: 1, (null or folder id)
		model_id: 1, (null or model id),
		type: objects|relationships,
		attributes: [
			{
				id: attribute_id,
				selected: true|false,
			},
			...
		]
	}	
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 42. Create Folder (Model Manager and Viewer): POST /create/folder


Request

```
	{
		login_key: "logged in user token",
		name: 'Folder 1',
		options: {
			id : 1, if set 0 then is root level, in this case the type can be empty as well,
			type : model | folder
		}
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	    id: 10,
	    name : name,
	    pages: 3
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 43. Get Available Object Types List: POST /model/available/object-types


Request

```
	{
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	    id: 10,
	    name : name,
	    pages: 3,
	    object_types: object_types : [
			{
				id : 1,
				name : 'Object Type 1'
			},
			{
				id : 2,
				name : 'Object Type 2'
			},
			{
				id : 3,
				name : 'Object Type 3'
			},
			{
				id : 3,
				name : 'Object Type 4'
			}
		]

	}
```

Response On Failure

```
	{
		status: true,
		error: '',
	}	
```

<hr>

## 45. Delete Model/Folder items: POST /delete/models

Note that each deleted model can have multiple objects, folders and each deleted folder can have multiple folders, models, objects which means we should remove all in tree that associated with deleted item.

Request

```
	{
		login_key: "logged in user token",
		selected_items: [
			{
				id : 1,
				type : 'model'
			},
			{
				id : 2,
				type : 'folder'
			},
		],
	}	
```

Response On Success

```
	{
		status: true,
		error: '',
		page_items: [
			{ id: 0, type : '', pages: 10, has_childs: true|false, },
			{ id: 1, type : 'folder', pages: 4, has_childs: true|false },
			{ id: 4, type : 'model', pages: 3, has_childs: true|false },
		]
	}
	
	Here we send response of deleted item parents with pages
```

Response On Failure

```
	{
		status : false,
		error : "Something went wrong"
}	
```
<hr>

## 46. Model/Folder details: POST /model/folder/details (deprecated)



Request

```
	{
		login_key: "logged in user token",
		id: 1,
		type: model or folder
	}	
```

Response On Success

```
	{
		status: true,
		error: '',
		details: {
          id: 1,
          name: 'New Item',
          type: 'folder',
          created_on: '05/04/2021',
          updated_on: '05/04/2021',
          created_by: 'Robert Plant'
    	}
	}
```

Response On Failure

```
	{
		status : false,
		error : "Something went wrong"
	}	
```
<hr>

## 46. Update Folder or Model Name (Model Manager and Viewer): POST /update/model


Request

```
	{
		login_key: "logged in user token",
		name: 'Folder 1',
		type: 'model|folder|view',
		id: '1', (this can be ID of model or folder or view)
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 47. Update Object Name: POST /update/object


Request

```
	{
		login_key: "logged in user token",
		name: 'Object 1',
		id: '1', (this can be ID of object)
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	    model_id: '1234'
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 47.1. Check of Object(s) used in any diagrams: POST /model/object/used/diagrams

Notes: regardless we receive on or multiple objects, in case one of them has used in any Diagram XML, it should return `true` for `has_used_in_diagram`
Request

```
	{
		login_key: "logged in user token",
		object_ids: [1,...],
	}	
```

Response On Success

```
	{
    	status: true;
    	has_used_in_diagram: true|false;
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>


## 48. Delete Object: POST /delete/object

Notes: if `delete_from_diagrams` is set, we should go through Diagrams and if this object found in there, remove the <plutoCell tag associated with this object ID, the same for it's relationships.

Request

```
	{
		login_key: "logged in user token",
		id: '1',
		delete_from_diagrams: true|false
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
		parent_id: "1234" (this can be folder or model id, the parent of the object),
		model_id: "12345",
		has_childs: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 49. Model and Folder Drag & Drop: POST /update/structure


Request

```
	{
		login_key: "logged in user token",
		id: 1 (model or folder id that we move to another place),
		new_parent_id: 2 (where to move the model/folder)
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 50. Show Available and Selected Attributes POST /object/available/attributes

Here we display all (including selected and not selected) attributes found for objects with their selected/not selected status. Please note we need some pagination there as well.
<br><br>
Note: System properties should be in list too and they need to work with pagination like other attributes. We need to sort this attribtues result by ascending.


Request

```
	{
		login_key: "logged in user token",
		object_ids: [1,2], (see notes)
		folder_id: 1, (see notes)
		model_id: 1, (see notes),
		page: 1
	},
	
	only 1 of these 3 can have value object_ids, folder_id, model_id.
	
```

Response On Success

```
	{
		status: true,
		pages: 50,
		attributes: [
			{
				attribute_id: 1,
				name : 'Attribute 1',
				selected: true|false,
				type: 'attribute'
			},
			...
			{
				name : 'Created By',
				type: 'created_by'
			},
			{
				name : 'Created Date',
				type: 'created_date'
			},
			{
				name : 'Update By',
				type: 'updated_by'
			},
			{
				name : 'Object Type',
				type: 'object_type'
			},
			{
				name : 'Model',
				type: 'model'
			},
			{
				name : 'Description',
				type: 'description'
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 51. Search Objects POST /objects/search


Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		objects: [
			{
				object_id: 1,
				name : 'Object 1',
			},
			{
				object_id: 2,
				name : 'Object 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 52. Search Relationship Types POST /relationship/types/search

Notes: 

1. When `to_object_id` has value, we shoud lookup for relationship types that from/to can be linked with, otherwise return relationship types based on `from_object_ids`
2. When the `relationship_type_id` presents in request, need to check if that relationship type could be used in combination. If yes, include that in result

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string",
		from_object_ids: [1,...],
		page: 1,
		to_object_id: 1 (can be null too),
		relationship_type_id: 1234
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		relationship_types: [
			{
				relationship_type_id: 1,
				name : 'Relationship Type 1',
				metamodel_name: "Metamodel 1",
			},
			{
				relationship_type_id: 2,
				name : 'Relationship Type 2',
				metamodel_name: "Metamodel 2",
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 53. Create Relationship Type Combination POST /relationship/types/create/combination

Note: description can be null or string

Request

```
	{
		login_key: "logged in user token",
		relationship_type_id: "1"
		from_object_id: "2",
		to_object_id: "3",
		description: "some description here" (Optional, can be null as well)
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		relationship_types: [
			{
				relationship_type_id: 1,
				name : 'Relationship Type 1',
			},
			{
				relationship_type_id: 2,
				name : 'Relationship Type 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 54. Add Relationship POST /relationship/create

Note: description can be null or string

Request

```
	{
		login_key: "logged in user token",
		relationship_type_id: "1"
		from_object_ids: [1,2,3...],
		to_object_id: "3",
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 54.1 Edit Relationship POST /relationship/update


Request

```
	{
		login_key: "logged in user token",
		relationship_id: 1,
		relationship_type_id: "1"
		from_object_id: "2",
		to_object_id: "3",
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```


## 55. Object To (Relationship) search POST /relationship/to/object/search

Notes: 

1. Each Relationship Type can have multiple combinations of the same "from" object, here we return "To" objects that found in combinations matching "From" objects (all in array) and searching inside "Relationship Type".

2. In case we have a relationship already with this object using the relationship type mentioned, it should show `has_relationship` as `true`, otherwise `false` 


Request

```
	{
		login_key: "logged in user token",
		from_object_ids: [1,2,3...]",
		relationship_type_id: "1234",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		objects: [
			{
				object_id: 1,
				name : 'Object 1',
				model_id: 1,
				model_name: "Model1",
				has_relationship: true|false,
			},
			{
				object_id: 2,
				name : 'Object 2',
				model_id: 2,
				model_name: "Model 2",
				has_relationship: true|false
			},
			...
		]
	}
```	

## 55.1 Object From (Relationship) search POST /relationship/from/object/search

Notes: Need to get objects that can be assigned with selected Relationship Type and To Objects


Request

```
	{
		login_key: "logged in user token",
		to_object_id: "1234",
		relationship_type_id: "1234",
		keyword: "text or empty string"
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		objects: [
			{
				object_id: 1,
				name : 'Object 1',
				model_id: 1,
				model_name: "Model1",
			},
			{
				object_id: 2,
				name : 'Object 2',
				model_id: 2,
				model_name: "Model 2",
			},
		]
	}
```	


## 56. Search Objects POST /object/type/search

Notes: the `model_id` is optional, but when is set we have to show only object types that are related to this model. Model's have one/multiple Object Types and based on that we can find matches.

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string",
		model_id: 1, (optional)
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		object_types: [
			{
				object_type_id: 1,
				name : 'Object 1',
			},
			{
				object_type_id: 2,
				name : 'Object 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 56.2 Search Metamodels POST /metamodel/search


Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		metamodels: [
			{
				metamodel_id: 1,
				name : 'Metamodel 1',
			},
			{
				metamodel_id: 2,
				name : 'Metamodel 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 57. Resize In Line Editor Column Width POST /resize/inline/editor/column

Notes: In case we resize attribute you will receive "attribute_id" and type `attribute`. In case we resize model or object_name the "attribute_id" would be `null` and type accordingly `model` or `object_name`. Need to be stored unique by each logged in user. userInlineEditorColumns collection can handle it with `user_id`, `attribute_id`, `type` and `width` columns.

Request

```
	{
		login_key: "logged in user token",
		attribute_id: "1", (optional, can be null as well),
		type : "model|object_name|attribute|created_by|created_date|updated_by|updated_date|object_type|description|from_object|relationship_type|to_object"
		width: "10" (number)
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 58. Resize In Line Editor Row Height POST /resize/inline/editor/cell-height

Request

```
	{
		login_key: "logged in user token",
		id: "1",
		type: "object|relationship",
		height: "10" (number)
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 59. Model/Folder Details POST /model/folder/info

Notes: for the `updated_by` and `updated_date` we need to store user who last time modified the record. In case of model it can be any change made inside that model, in case of folder only when we change something inside that folder. In case of diagram it will be handled by note change or other API things, specs will be given<br>
For the `description` it's a new field and should contain some text for notes for each folder/model. Can be empty by default until we add it.


Request

```
	{
		login_key: "logged in user token",
		id: "1",
		type: "model|folder|diagram|view"
	},
	
```

Response On Success

```
	{
		status: true,
		info: {
			created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			description: "text",
			is_manual_imported: true|false
		}
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 60. Model/Folder Update Description POST /model/folder/update/info


Request

```
	{
		login_key: "logged in user token",
		id: "1",
		type: "model|folder|diagram|view",
		description: "empty or new description"
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```


## 61. Object Update Description POST /object/update/description


Request

```
	{
		login_key: "logged in user token",
		id: "1",
		description: "empty or new description"
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 62. Add Date Format to Settings POST /update/settings


Request

```
	{
		login_key: "logged in user token",
		settings: {
			user_settings: {
				diagram_new_tab: true|false,
				model_viewer_pages: number,
				exit_behavior: "exit_tab|exit_to_model"
				prompt_diagram_object_delete: true|false,
				prompt_diagram_reuse_objects: true|false,
			},
			global_settings: {
				format: "day month year", (or this can be month day year, any combination, save as string the way received from the from the request)
				separator: "/" (this can be " " space too),
				region: 'us',
				diagram_new_tab: true|false,
				model_viewer_pages: number,
				exit_behavior: "exit_tab|exit_to_model"
				prompt_diagram_object_delete: true|false,
				prompt_diagram_reuse_objects: true|false,
				calculated_minutes: 10,
				currency: "usd"
			}
		}
	},
	
```

Response On Success

```
	{
		status: true,
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```


## 63. Get Date Format Settings POST /settings/date/format


Request

```
	{
		login_key: "logged in user token",
	},
	
```

Response On Success

```
	{
		status: true,
		format: "day month year", (or this can be month day year, any combination)
		separator: "/" (this can be " " space too),
		diagram_new_tab: true|false (boolean),
		model_viewer_pages: 50 (number),
		exit_behavior: "exit_tab|exit_to_model",
		prompt_diagram_object_delete: true|false,
		prompt_diagram_reuse_objects: true|false,
		region: 'us',
		currency: "usd"
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 63.1 Get Settings POST /settings


Request

```
	{
		login_key: "logged in user token",
	},
	
```

Response On Success

```
	{
		status: true,
		user_settings: {
			diagram_new_tab: true|false (boolean),
			model_viewer_pages: 50 (number),
			exit_behavior: "exit_tab|exit_to_model",
			prompt_diagram_object_delete: true|false,
			prompt_diagram_reuse_objects: true|false,
		},
		global_settings: {
			diagram_new_tab: true|false (boolean),
			model_viewer_pages: 50 (number),
			exit_behavior: "exit_tab|exit_to_model",
			prompt_diagram_object_delete: true|false,
			prompt_diagram_reuse_objects: true|false,
			format: "day month year", (or this can be month day year, any combination)
			separator: "/" (this can be " " space too),
			region: 'us',
			calculated_minutes: 10,
			currency: "usd"
		},
		is_administrator: true|false
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```


## 64. Model Viewer Folder/Object Drag & Drop: POST /update/model/viewer/structure

Notes: This drag & drop is for Model Viewer left sidebar (tree) view. We can drag folders or objects to another folders or move them to top under model root level.

Important: the `new_parent_type` can be `object` only when dropped element is `object`, otherwise the old logic should work and we can ignore `new_parent_type`.


Request

```
	{
		login_key: "logged in user token",
		drop_items: [
			{
				id: 1,
				type: "object"
			},
			{
				id: 2,
				type: "view"
			},
			...
		] (object|folder|diagram_id|view id that we move to another place),
		type: 'model|folder|object|diagram|view'
		new_parent_id: 2 (where to move the object/folder etc),
		new_parent_type: model|folder|object
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 65. Add Multiple Inline Editor Objects: POST /add/multiple/objects

Notes: The attributes can be empty array as well, it's the same structure we have for update attributes page. The same values.  For multiple values it's splitted using `__##__` as in #39.


Request

```
	{
		login_key: "logged in user token",
		new_objects: [
			{
				name: "Object Name",
				model_id: "1",
				object_type_id: "1",
				attributes: [
					{
						"attribute_id" : "1",
						"value" : "some value here"
					},
					...
				]
			},
			...
		]
		parent_id: 1,
		parent_type: (model|folder)
	}	
```

Response On Success

```
	{
	    status: true,
	    objects: [
	    	{
	    		id: 1,
	    		name: "Object 1"
	    	},
	    	...
	    ],
	    pages: 10, (pages after adding new items for selected parent)
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>
## 66. Update Object System Properties POST /update/object/available/system/properties


Notes: we will have one of object_ids|folder_id|model_id, similar to In Line Editor API. Received params (only in send list, we might have properties on other pages but we work with request) should be marked as "selected" if found in model objects, folder objects or object(s).

Request

```
	{
		login_key: "logged in user token",
		object_ids: [1] (array or null containing 1 or multiple object ids)
		folder_id: 1, (null or folder id)
		model_id: 1, (null or model id),
		type: "objects|relationships"
		properties: [
			{
				type: created_by|created_date|updated_by|updated_date|object_type|model_name|description,
				selected: true|false,
			},
			...
		]
	}	
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 67. Update Objects Type POST /update/model/object/type


Request

```
	{
		login_key: "logged in user token",
		object_id: 1
		object_type_id: 1
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 68. List Of Diagram Types: POST /diagram/types

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagram_types: [
			{
				id: 1,
				name: "Object Type 1",
				created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 69. Add Diagram Type: POST /diagram/types/create

Request

```
	{
		name: "Diagram Type 1",
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 70. Edit Diagram Type: POST /update/diagram/type

Request

```
	{
		id: 1,
		login_key: "logged in user token",
		name: "Diagram Type 1",
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 71. Delete Diagram Type: POST /delete/diagram/type

Request

```
	{
		diagram_type_ids: [1, 2] (one or multiple diagram type ids),
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items),
		has_childs: true|false
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 72. Diagram Type Details: POST /diagram/type/detail

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagram_type_data: {
			id: 1,
			name: "Diagram type 1",
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 73. Search Diagram Types POST /diagram/type/search

Notes: 

1. Sort this by match by metamodel name ascending, diagram type name ascending (both not case sensitive). Bulk `page` argument by calculating 20 items per page
2. When the `model_id` is set, show only associated Diagram types with model's Metamodel

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string",
		model_id: 1, (optional)
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		diagram_types: [
			{
				diagram_type_id: 1,
				name : 'Diagram Type 1',
				metamodel_name: 'Metamodel 1',
			},
			{
				diagram_type_id: 2,
				name : 'Diagram Type 2',
				metamodel_name: 'Metamodel 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 74. Create Diagram POST /create/diagram


Request

```
	{
		login_key: "logged in user token",
		diagram_data : {
			name : "Object 1",
			diagram_type_id: "1"
		},
		options: {
			id: 12345678, If set 0 then is root level,
			type: model or folder
		}
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		id: 1,
		name: "Diagram 1",
		pages: 10, page of parent childs after adding new item, note that parent can be model and folder as well
	}	
```
<hr>

## 75. Update Diagram: POST /update/diagram


Request

```
	{
		login_key: "logged in user token",
		name: 'Diagram 1',
		id: '1'
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 76. Delete Diagram: POST /delete/diagram


Request

```
	{
		login_key: "logged in user token",
		id: '1'
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	    has_childs: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 77. Get Object Property Details POST /object/property/details



Request

```
	{
		login_key: "logged in user token",
		object_id: 1234
	}	
```

Response On Success

```
	{
		status: true,
		error: "",
		id : 1 //object N ID,
		name: "Object 1",
		object_type: "Object type 1",
		model_name : "Model 1 (note that model name be at any top level)",
		created_date: "Y-m-d H:i:s" (date or empty/null),
		created_by: "user name who created the record",
		updated_by: "user name who modified model/folder or it's attributes last time",
		updated_date: "Y-m-d H:i:s" (date or empty/null),
		description: "text",
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 78. Update Diagram XML POST /diagram/update/xml

Notes: 

1. `diagram_libraries` can be empty too, which means we should delete added Diagram custom libraries. The `id` inside `custom_libraries` if null/empty means we should add new library, for the xml it can be empty too but in that case we don't have to update xml, only when it has a value, the name should be updated too. The `svg` can be empty or svg string.<br>

2. SVG padding: `svg_padding_top` and `svg_padding_left` can be null too and number too (even 0). If null, we don't have to update those values, only when is a number.

3. When the `sync` is `true` we should process object creating, rename, delete etc, the same for the relationships. If is `false` we have to update XML and SVG items etc but without touching the objects/relationships.

4. When `sync` is `true` and we have any of `created_objects` and `deleted_objects`, `deleted_relationships` collected, then we send a POST request to `WebSocketURL` to `/diagram/objects/sync` with a special token. This request doesn't have to be JWT encoded.

```
	THIS REQUEST IS FOR #4
	{
		token: "1234",
		created_objects: [
			{
				id: 1234,
				name: "Object 1",
				parent_id: 1234,
				parent_parent_id: 1234,
				model_id: 1234
			},
			...
		],
		deleted_objects: [
			{
				id: 1234,
				name: "Object 2",
				parent_id: 1234,
				parent_parent_id: 1234,
				model_id: 1234
			},
			...
		],
		deleted_relationships: [
			{
				id: 1234,
				from_object_id: 1,
				to_object_id: 2,
				model_id: 1234
			},
			...
		],
		created_relationships: [
			{
				id: 1234,
				from_object_id: 1,
				to_object_id: 2,
				model_id: 1234
			},
			...
		]
	}

```


Update Diagram Request

```
	{
		login_key: "logged in user token",
		diagram_id: 1234,
		xml: (this is for Diagram's XML content, each Diagram can have only 1 xml which is the same what we draw in Diagram Editor),
		diagram_libraries: [
			{
				id: "12345", (in case of new items it's empty),
				name: "Custom Library 1",
				xml: "we need to check if xml has a value, if presents then only we updating XML, otherwise ignoring and updating only name"
			}
		],
		svg: "<svg...",
		svg_padding_top: 10 "please note that this can be null too",
		svg_padding_left: 10 "please note that this can be null too",
		sync: true|false,
		deleted_objects: [1,2,...],
		deleted_relationships: [1,2,...]
	}
```

Response On Success

```
	{
		status: true,
		error: "",
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 79. Get Diagram XML POST /diagram/get/xml

Notes: we might/might not have libraries, but need always include argument in response, if empty just `libraries:[]`. Sort by default library name ascending, then manual library created date asc.

Request

```
	{
		login_key: "logged in user token",
		diagram_id: 1234
	}
```

Response On Success

```
	{
		status: true,
		error: "",
		xml: "xml content here or empty string if no xml is created yet",
		name: "Diagram name here",
		model_id: "1",
		model_name: "Model name here",
		created_date: "Y-m-d H:i:s" (date or empty/null),
		created_by: "user name who created the record",
		updated_by: "user name who modified model/folder or it's attributes last time",
		updated_date: "Y-m-d H:i:s" (date or empty/null),
		diagram_parent_id: "diagram parent's id",
		is_manual_imported: true|false,
		"libraries": [
			{
				id: "1234",
				name: "General",
				code: "general",
				is_default: "1|0",
				xml: "We don't need an xml for default libraries, only for custom ones"
			},
			...
		],
		"diagram_libraries": [
			{
				id: "1234",
				name: "General",
				xml: "We don't need an xml for default libraries, only for custom ones"
			},
			...
		],
		exit_behavior: "exit_tab|exit_to_model",
		prompt_diagram_object_delete: true|false,
		prompt_diagram_reuse_objects: true|false,
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 80. Get Diagram Default Selected Libraries POST /diagram/default/libraries

Request

```
	{
		login_key: "logged in user token",
		diagram_id: "1234"
	}
```

Response On Success

```
	{
		status: true,
		error: "",
		libraries: [
			{
				id: "1234",
				name: "General",
				code: "general"
			},
			{
				id: "1234",
				name: "Misc",
				code: "misc"
			},
			{
				id: "1234",
				name: "Bootstrap Components",
				code: "bootstrap"
			},
			...
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 81. Get Diagram Custom Libraries POST /diagram/custom/libraries

Request

```
	{
		login_key: "logged in user token",
		diagram_id: "1234"
	}
```

Response On Success

```
	{
		status: true,
		error: "",
		libraries: [
			{
				id: "1234",
				name: "Lib1",
				code: "some_lib",
				encoded_xml: "encoded xml file here"
			},
			{
				id: "1234",
				name: "Lib2",
				code: "some_lib2",
				encoded_xml: "encoded xml file here"
			},
			...
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 82. Delete Diagram Custom Library POST /diagram/delete/custom/library

Request

```
	{
		login_key: "logged in user token",
		diagram_id: "1234",
		custom_library_id: "12345"
	}
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 83. Add Diagram Custom Library POST /diagram/add/custom/library

Request

```
	{
		login_key: "logged in user token",
		diagram_id: "1234",
		name: "Lib1",
		code: "empty or some string, can be json too",
		encoded_xml: "string, no limits"
	}
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 84. Diagram Type Library Items POST /diagram/type/library/items

Notes: is_default stays if the library is default or manually added for this Diagram Type. It can be either 1 or 0.

Request

```
	{
		login_key: "logged in user token",
		diagram_type_id: "1234"
	}
```

Response On Success

```
	{
		status: true,
		libraries: [
			{
				id: '1',
          	name: 'General',
          	is_default: '1', (either 1 or 0)
          	shape_types: [
		          {
		            id: '100',
		            name: 'Rectangle',
		            svg: '<svg...',
		            is_edge: false,
		          },
		          {
		            id: '101',
		            name: 'Square',
		            svg: '<svg...',
		            is_edge: false,
		          },
		          ...
      			]
			},
			{
				id: '2',
          	name: 'Advanced',
          	is_default: '1', (either 1 or 0)
          	shape_types: [
		          {
		            id: '102',
		            name: 'Flowbox',
		            svg: '<svg...',
		            is_edge: false
		          },
		          {
		            id: '103',
		            name: 'TreeView',
		            svg: '<svg...',
		            is_edge: true
		          },
		          ...
      			]
			},
			...
   		],
   		combinations: [
   			{
   				id: 1,
   				library_id: '1',
   				library_name: "Lib1",
   				shape_type_id: '123',
      			shape_type_name: 'Rectangle',
      			shape_type_svg: '<svg...',
      			object_type_id: '2',
      			object_type_name: 'Object Type 1'
   			},
   			{
   				id: 2,
   				library_id: '2',
   				library_name: "Lib2",
   				shape_type_id: '123',
      			shape_type_name: 'TreeView',
      			shape_type_svg: '<svg...',
      			object_type_id: '2',
      			object_type_name: 'Object Type 2'
   			},
   			...
   		],
		connector_combinations: [
   			{
   				id: 1,
   				library_id: '1',
   				library_name: "Lib1",
   				shape_type_id: '123',
      			shape_type_name: 'Rectangle',
      			shape_type_svg: '<svg...',
      			relationship_type_id: '2',
      			relationship_type_name: 'Object Type 1'
   			},
   			...
		],
	}
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 85. Object Types List POST /object/types/list

Notes: by default should be set getting 50 items per request. Sort by ascending.

Request

```
	{
		login_key: "logged in user token",
		page: 1
	}
```

Response On Success

```
	{
		status: true,
		pages: 2 (this indicates how many pages we have for 50 items calc, can be 0 too),
		object_types: [
			{
				id: 1,
				name: 'Object Type 1',
			},
			{
				id: 2,
				name: 'Object Type 2',
			},
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 86. Update Diagram Type Combinations POST /diagram/type/update/combinations

Notes: 

1. The `library_items` is marking the libraries user mentioned to see on their dashboard for that DiagramType. The `is_default` flag is only for backend to easily get the right collection, no need to use that to update the is_default flag. If user has 10 default libraries and received only 2 from this API then the rest needs to be removed from this view. If user deleted not default libraries (the manual ones uplaoded for this DiagramType) then we checking if they are not in list and then deleting from database too. Need to add this `library_items` logic first, then `combinations` as we might have new library added and associated Shape Types.

2. The `combinations` can be an empty array as well when no combinations selected. There is validation in front end that is not allowing to save the same object_type_id or shape_type_id multiple times. In backend the same validation should appear (for now only on DiagramType level). So if shape_type_id/object_type_id repeated twice we should not insert new data (this is in case they have the same page open in multiple browser tabs and modified in both cases).

Request

```
	{
		login_key: "logged in user token",
		diagram_type_id: 1,
		name: "Diagram type name",
		library_items: [
			{
				id: 1,
				is_default: 1 (is either 1 or 0)
			}
		],
		combinations: [
			{
				id: 1, (this will not present for a new items),
				library_id: 1,
				shape_type_id: 1,
				object_type_id: 1,
				library_id: 1
			}
		],
		connector_combinations: [
			{
				id: 1, (this will not present for a new items),
				library_id: 1,
				shape_type_id: 1,
				relationship_type_id: 1,
			}
		],
	}
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 87. Add Diagram Type Library POST /diagram/type/add/library


Request

```
	{
		login_key: "logged in user token",
		diagram_type_id: "1234",
		name: "Lib1",
		code: "empty or some string, can be json too",
		encoded_xml: "string, no limits",
		shapes: [
			{
				svg: '<svg...',
				encoded_xml: 'encoded xml string'
				type: 'shape|image',
				is_edge: true|false,
				shape_style: "string, e.g rounded=0;whiteSpace=wrap;html=1;",
				children_style: [ (can be empty array too)
					"rounded=0;whiteSpace=wrap;...",
					"rounded=0;whiteSpace=nowrap;...",
					...
				]
			},
			...
		]
	}
```

Response On Success

```
	{
		status: true,
		id: "1234" (library id),
		shapes: [
			{
				id: "12345",
				svg: '<svg...',
				type: 'shape|image'
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 88. Get Diagram Object Shape XML POST /diagram/object/shape

Notes: 

1. Eeach Object has Object Type (one to one). Object Types have shape combinations for each Diagram Type. <br> Based on Diagram we are getting it's Diagram Type then checking if we have shape assigned to that Object Type for this specific Diagram Type. If so, sending shape's encoded_xml.

Object -> (one to one) -> Object Type<br>
Diagram -> (one to one) -> Diagram Type -> (combinations) -> {Object Type match with shape}

2. The `export_attributes` should contain object those attributes who have the `export_do_diagram` flag set `true` and they have value (are not `null`). The response for `selected_value` should be the 

Request

```
	{
		login_key: "logged in user token",
		diagram_id: "1234",
		object_id: "1234",
	}
```

Response On Success

```
	{
		status: true,
		name: "object name", (we should always have this name as getting object_id)
		library_id: "1234",
		shape_type_id: "1234",
		shape_type_name: "some name if presents or null",
		encoded_xml: "Either shape encoded xml or just null",
		svg: "<svg...",
		export_attributes: [
      			{
	            attribute_id: '1',
	            name: 'Some Text',
	            type: 'text',
	            selected_value: ['Sample of text attribute'],
	          },
	          {
	            attribute_id: '2',
	            name: 'Some Date',
	            type: 'date',
	            selected_value: ['2021-04-16'],
	          },
	          {
	            attribute_id: '21',
	            name: 'Some Date Range',
	            type: 'date_range',
	            selected_value: ['2021-04-16','2021-04-17'],
	          },
	          {
	            attribute_id: '3',
	            name: 'Some Decimal',
	            type: 'decimal',
	            selected_value: '4.0',
	            values: ['1.0', '1.5'],
	            currency: 'USD',
	          },
	          {
	            attribute_id: '4',
	            name: 'Some Integer',
	            type: 'integer',
	            selected_value: '5',
	            values: ['1', '2'],
	            currency: 'EUR',
	          },
	          {
	            attribute_id: '5',
	            name: 'Some Boolean',
	            type: 'boolean',
	            selected_value: 'true',
	          },
	          {
	            attribute_id: '6',
	            name: 'Some List',
	            type: 'list',
	            selected_value: ['Option 2'],
	          },
	          {
	            attribute_id: '7',
	            name: 'Some Multiple List',
	            type: 'multiple-list',
	            selected_value: ['Multiple 1', 'Multiple 2'],
	          },
	          {
	            attribute_id: '8',
	            name: 'Another Text 8',
	            type: 'text',
	            selected_value: ['Cool text']
	          },
	          {
	            attribute_id: '9',
	            name: 'Event Date',
	            type: 'date',
	            selected_value: ['2021-04-20']
	          },

			...
		]
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 89. Relationship Types List POST /relationship/types/list

Notes: by default should be set getting 50 items per request. Sort by ascending.

Request

```
	{
		login_key: "logged in user token",
		page: 1
	}
```

Response On Success

```
	{
		status: true,
		pages: 2 (this indicates how many pages we have for 50 items calc, can be 0 too),
		relationship_types: [
			{
				id: 1,
				name: 'Relationship Type 1',
			},
			{
				id: 2,
				name: 'Relationship Type 2',
			},
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 90. Detect Shape ID From XML POST /get/shape/from/xml

Notes: the xml string would be received along with the Diagram ID, we need to get the Diagram Type from that Diagram and check if that Diagram Type has any shape with that XML string matching. Please check only for Diagram Type level shapes (default + manual) not Diagram manual lib added ones.

Request

```
	{
		login_key: "logged in user token",
		diagram_id: 1234,
		encoded_xml: "some encoded string here"
	}
```

Response On Success

```
	{
		status: true,
		shape_id: '1234',
		library_id: '12345',
		is_default: '1 or 0',
		relationship_type_id: "12345",
		object_type_id: "12345"
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 91. Diagram New Object & Relationship Processing POST /diagram/handle/objects/relationships

Notes: If we have any of `created_objects` and `deleted_objects`, `deleted_relationships` collected, then we send a POST request to `WebSocketURL` to `/diagram/objects/sync` with a special token. This request doesn't have to be JWT encoded.

Main Request

```
{
	items: [
		{
			mx_temp_id: '1234',
			object_id: '1234 or null',
			shape_xml: '<...',
			name: '<...'
		},
		{
			mx_temp_id: '1234',
			shape_xml: '<...',
			name: '<...'
		},
	],
	relationships: [
		{
			mx_relationship_temp_id: '1234',
			relationship_shape_xml: '<...',
			mx_temp_from_id: '1234',
			mx_temp_to_id: '1234'
		},
		...
	],
	reusable_object_ids: [1,2...]
}
```

```
	THIS REQUEST IS FOR Websockets
	{
		token: "1234",
		created_objects: [
			{
				id: 1234,
				name: "Object 1",
				parent_id: 1234,
				parent_parent_id: 1234,
				model_id: 1234
			},
			...
		],
		deleted_objects: [
			{
				id: 1234,
				name: "Object 2",
				parent_id: 1234,
				parent_parent_id: 1234,
				model_id: 1234
			},
			...
		],
		deleted_relationships: [
			{
				id: 1234,
				from_object_id: 1,
				to_object_id: 2,
				model_id: 1234
			},
			...
		],
		created_relationships: [
			{
				id: 1234,
				from_object_id: 1,
				to_object_id: 2,
				model_id: 1234
			},
			...
		]
	}

```

Response On Success

```
	{
		status: true,
		relationships: [
			{
				mx_temp_id: '1234', (This is mx_relationship_temp_id)
				relationship_type_id: "12345",
				relationship_id: "1234" (new created relationship id)
			},
			...
		],
		objects: [
			{
				mx_temp_id: '1234',
				object_id: '12345',
				name: "Object Name"
			},
			...
		]
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 91.1 Diagram Check Object & Relationship Reuse POST /diagram/reuse/objects/relationships

Request

```
{
	items: [
		{
			mx_temp_id: '1234',
			object_id: '1234 or null',
			shape_xml: '<...',
			name: '<...',
			object_type_name: "Best Object",
			model_name: "Best Model",
		},
		{
			mx_temp_id: '1234',
			shape_xml: '<...',
			name: '<...',
			object_type_name: "Best Object",
			model_name: "Best Model",
		},
	],
	relationships: [
		{
			mx_relationship_temp_id: '1234',
			relationship_shape_xml: '<...',
			mx_temp_from_id: '1234',
			mx_temp_to_id: '1234'
		},
		...
	]
}
```

Response On Success

```
	{
		status: true,
		objects: [
			{
				object_id: '12345',
				name: "Object Name"
			},
			...
		]
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 92. Get Diagram SVG Details POST /get/diagram/svg


Request

```
{
		login_key: "logged in user token",
		diagram_id: 1234
}
```

Response On Success

```
	{
		status: true,
		svg: "<svg...",
		svg_padding_top: 10,
		svg_padding_left: 20,
		settings: {
			date_format : "day month year",
			separator: "/"
		},
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 93. Get Object/Relationship/Shape Details POST /diagram/object/relationship/details

Notes: `object_id`, `relationship_type_id`,`relationship_id` can be null too or any of them. First we need to check if we have `object_id` received, then we checking if we have that object, if so, returning the same response we have in #37 API, please copy logic from there (if object found, sending "Response 1", see bellow). If we have `object_id` but no match in database, then we are checking the `cell_xml` to see if it's matching with any Shape/Object Type if so, we are sending "Response 2".

If we receive `relationshi_id` then we checking if we have a match for that `relationship_id` and showing "Response 2".

If we receive `relationship_type_id` then we checking if we have a match for that `relationship_type_id` and showing "Response 2".


If we have no `object_id` and no `relationship_type_id` or we have ids but no match in db, then we trying to get it by `cell_xml` if we have it. Then showing "Response 2".

In case of no match by `cell_xml` too, then showing "Response 2" with `type` = `not_found`




Request

```
	{
		login_key: "logged in user token",
		object_id: "1234",
		relationship_id: "1234",
		relationship_type_id: "1234",
		cell_xml: "some xml here or empty string"
	}	
```

`Response 1` when object found 

```
	{
		status: true,
		error: "",
		type: "object"
		settings: {
			date_format : "day month year",
			separator: "/"
		},
		object_type_attributes: [
			id : 1 //object N ID,
			name: "Object 1",
			object_type: "Object type 1",
			model_name : "Model 1 (note that model name be at any top level)",
			created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			description: "text",
			attributes: [
				{
                    attribute_id : '1',
                    name : 'Some Text',
                    type : 'text',
                    selected_value : 'Sample of text attribute'
                  },
                  {
                    attribute_id : '2',
                    name : 'Some Date',
                    type : 'date',
                    selected_value : '2021-04-16'
                  },
                  {
                    attribute_id : '3',
                    name : 'Some Decimal',
                    type : 'decimal',
                    selected_value : '4.0',
                    values : ['1.0','5.0'],
                    currency : 'USD',
                    decimal_spaces : "1"
                  },
                  {
                    attribute_id : '4',
                    name : 'Some Integer',
                    type : 'integer',
                    selected_value : '5',
                    values : ['1','10'],
                    currency : 'EUR'
                  },
                  {
                    attribute_id : '5',
                    name : 'Some Boolean',
                    type : 'boolean',
                    selected_value : 'true',
                  },
                  {
                    attribute_id : '6',
                    name : 'Some List',
                    type : 'list',
                    selected_value : 'Option 2',
                    values : ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
                  },
                  {
                    attribute_id : '7',
                    name : 'Some Multiple List',
                    type : 'multiple-list',
                    selected_value : ['Multiple 1', 'Multiple 2'],
                    values : ['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'],
                  },
			],
			{
				id : 2 //object N ID,
				name: "Object 1",
				object_type: "Object type 1",
				attributes: [
					...
				]
			}
		]
	}	
```

`Response 2` when object cell match found or relationship cell match found, we can have either object_id with it's data or relationship_type_id with it's data

```
	{
		status: true,
		error: "",
		type: "object_type|relationship_type|relationship|not_found",
		object_type_name: "Object Type Name",
		object_type_id: "1",
		relationship_type_name: "Some relationship type name",
		relationship_type_id: "1",
		shape_name: "Shape Name",
		library_name: "Library Name",
		from_object_name: "Object 1",
		to_object_name: "Object 2",
		settings: {
			date_format : "day month year",
			separator: "/"
		},
		attribute_tabs: [
	        {
	            id: "1", (tab id)
	            name: "tab 1",
	            attribute_ids: [1,2,3,4,...]
	        },
	        ...
	    ],
		attributes: [
			{
            attribute_id : '1',
            name : 'Some Text',
            type : 'text',
            selected_value : 'Sample of text attribute'
          },
          {
            attribute_id : '2',
            name : 'Some Date',
            type : 'date',
            selected_value : '2021-04-16'
          },
          {
            attribute_id : '3',
            name : 'Some Decimal',
            type : 'decimal',
            selected_value : '4.0',
            values : ['1.0','5.0'],
            currency : 'USD',
            decimal_spaces : "1"
          },
          {
            attribute_id : '4',
            name : 'Some Integer',
            type : 'integer',
            selected_value : '5',
            values : ['1','10'],
            currency : 'EUR'
          },
          {
            attribute_id : '5',
            name : 'Some Boolean',
            type : 'boolean',
            selected_value : 'true',
          },
          {
            attribute_id : '6',
            name : 'Some List',
            type : 'list',
            selected_value : 'Option 2',
            values : ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5'],
          },
          {
            attribute_id : '7',
            name : 'Some Multiple List',
            type : 'multiple-list',
            selected_value : ['Multiple 1', 'Multiple 2'],
            values : ['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'],
          },
		],
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 94. Delete Relationships POST /delete/relationships


Request

```
	{
		delete_permanent: true|false,
		relationships: [
			{
				id: 1,
				type: 'object_relationship|diagram_relationship'
			}
		]
	}
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 95. Get Relationship Details POST /get/relationship/details


Request

```
	{
		relationship_id: "1234"
	}
```

Response On Success

```
	{
		status: true,
		relationship_type_name: "Type1",
		from_object_name: "Object1",
		to_object_name: "Object2",
		created_date: "Y-m-d H:i:s",
		created_by: "User1"
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 96. Get Relationship Type Details POST /get/relationship/type/details


Request

```
	{
		relationship_type_id: "1234"
	}
```

Response On Success

```
	{
		status: true,
		relationship_type_name: "Type1",
		created_date: "Y-m-d H:i:s",
		created_by: "User1",
		updated_date: "Y-m-d H:i:s",
		updated_by: "User1",
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 97. Get Diagram Settings POST /get/diagram/settings


Response On Success

```
	{
		diagram_new_tab: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 98. Model Folder Copy & Paste POST /model/folder/copy

Note: need to have ability to paste the same folder/object at the same level too.

Possible target combinations <br>
1. `model` can be pasted into `folder`<br>
2. `folder` can be pasted into `folder`<br>
3. `object` can be pasted into `folder`, `object`, `model`<br>
4. `diagram` can be pasted into `folder`, `model`<br>
5. `view` can be pasted into `folder`, `model`


Request

```
	{
		copy_items: [
			{
				id: 1,
				type: "model|folder|object|diagram|view",
			}
		],
		destination_id: "12345",
		destination_type: "model|folder|object|diagram|view"
	}
```

Response On Success

```
	{
		status: true,
		pages: 1 (pages of destination_id after pasting a new item),
		has_childs: true|false,
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
<br>

#View Generation

## 99. Get Model View Filters POST /get/model/generator/filters

Notes: When the `type` is `model` or `folder` the `ids` will contain only 1 element in array, in case of `object` it can be either 1 or more.

When `type` is `model` or `folder` we check all sub item objects (at any level) and we collect their object types and filter out duplicates. The same is for attribute types and relationship types.

Other Notes: In case type is `view` then the `ids` will contain only `id` of the saved `view`. In this case need to return saved data.


Request

```
	{
		ids: ["1234","12345"] (ids),
		type: "model|folder|object|view"
	}
```

Response On Success

```
	{
		status: true,
		object_types: [
			{
				id: "1",
				name: "Object Type 1",
				is_other_model: "true|false",
			},
			{
				id: "2",
				name: "Object Type 2",
				is_other_model: "true|false",
			},
			...
		],
		relationship_types: [
			{
				id: "10",
				name: "Relationship Type 1",
				is_other_model: "true|false",
			},
			{
				id: "20",
				name: "Relationship Type 2",
				is_other_model: "true|false",
			},
			...
		],
		attribute_types: [
			{
				id: "30",
				name: "Attribute Type 1"
			},
			{
				id: "40",
				name: "Attribute Type 2"
			},
			...
		],
		relationship_description: "",
		/**RETURN THiS DATA ONLY WHEN TYPE IS VIEW*/
		report_type: model|folder|object,
		type: "box|hierarchy",
		filter_object_types: [1,2],
		filter_relationship_types: [1,2],
		filter_num_levels: 2,
		group_options: { (can be null if no group by used)
			id: 1,
			type: attribute|relationship
		},
		name: "Cool View",
		layout_type: "top_to_bottom|left_to_right|bottom_to_top|right_to_left"

	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 100. View Generation POST /get/model/generator/data

Notes: 

1. For the `hierarchy` view the we should display only 2 levels, main objects and childs. No need to show child of the childs.

2. The `group_id` is a just a temporary ID created in backend and `parent_group_id` is the parent group_id in case we have group inside group.

3. For `box` response we have a field - `other_model_id`, it should contain value when in response we have different models and if object's model is different to what we had on first level results, this should contain other model id or be null.

4. For `attribute_text` check & return value only when the `relationship_description` is set

Request

```
	{
		selected_ids: ["1234","12345"] (ids),
		selected_type: "model|folder|object|view",
		filter_object_types: [1,2] (object type ids, one or multiple or empty[]),
		filter_relationship_types: (relationship type ids, one or multiple or empty[]),
		filter_num_levels: "1234", (number),
		type: "box|hierarchy",
		group_options: { (can be null if no group by used)
			id: 12345,
			type: attribute|relationship
		},
		relationship_description: ""
```

1. Response On Success For `hierarchy` type

```
	{
		status: true,
    	data : [
	    	{
    			id: '1234',
            	name: "Main Object 1",
            	shape_type_color: '#6D6D6D',
            	shape_type_text_color: '#fff',
            	shape_type_border_color: "#fff",
            	shape_icon: 'Arch_Amazon-Chime.png|data:img...',
            	is_round_corners: true|false,
            	sub_levels: 1,
            	export_attributes : [
            		{
                    "currency": "USD",
                    "attribute_id": "60df33da1a61877cf877c96a",
                    "name": "TestAttribute106",
                    "type": "decimal",
                    "selected_value": [
                      "60"
                    ],
                    "decimal_places": "3"
                  },
                  {
                    "attribute_id": "60e5259365c8a0235c3fdb1e",
                    "name": "TestAttributeType",
                    "type": "date",
                    "selected_value": [
                      "2022-01-10"
                    ]
                  },
                  {
                    "currency": "usd",
                    "attribute_id": "60daef2605ee971f5c5d998d",
                    "name": "IntegerAttributeType",
                    "type": "integer",
                    "selected_value": [
                      "14"
                    ],
                    "decimal_places": ""
                  },
                  {
                    "currency": "gbp",
                    "attribute_id": "60daef0a05ee971f5c5d998b",
                    "name": "DecimalAttributeType",
                    "type": "decimal",
                    "selected_value": [
                      "51"
                    ],
                    "decimal_places": "3"
                  },
                  {
                    "attribute_id": "60fa8855d4aa7e22e3766174",
                    "name": "ZzzAttr",
                    "type": "date",
                    "selected_value": [
                      "2022-02-10"
                    ]
                  },
                  {
                    "attribute_id": "60daeef505ee971f5c5d998a",
                    "name": "DateAttributeType",
                    "type": "date",
                    "selected_value": [
                      "2022-03-10"
                    ]
                  },
                  {
                    "attribute_id": "60daef3905ee971f5c5d998f",
                    "name": "BooleanAttributeType",
                    "type": "boolean",
                    "selected_value": [
                      "true"
                    ]
                  },
                  {
                    "attribute_id": "6112a451cab6c2337fd3f481",
                    "name": "Multi",
                    "type": "multiple-list",
                    "selected_value": [
                      "One",
                      "Two"
                    ]
                  },
                  {
                    "attribute_id": "60daeee605ee971f5c5d9989",
                    "name": "TextAttributeType",
                    "type": "text",
                    "selected_value": [
                      "some value"
                    ]
                  },
                  {
                    "attribute_id": "60daef9905ee971f5c5d9995",
                    "name": "MultiListAttributeType",
                    "type": "multiple-list",
                    "selected_value": [
                      "ItemMul1",
                      "ItemMul2"
                    ]
                  },
                  {
                    "attribute_id": "6244b6f32ab1643bb8576e96",
                    "name": "Justin Is",
                    "type": "multiple-list",
                    "selected_value": [
                      "Awesome"
                    ]
                  },
                  {
                    "attribute_id": "60daef7105ee971f5c5d9991",
                    "name": "ListAttributeType",
                    "type": "list",
                    "selected_value": [
                      "Item1"
                    ]
                  },
                  {
                    "attribute_id": "60dc921c025cfd71d051c7b8",
                    "name": "Agile",
                    "type": "text",
                    "selected_value": [
                      "project management"
                    ]
                  }
            		...
            	],
            	items: [
            		{
                    id: "1",
                    name: "Object 1.1",
		           	shape_type_color: '#6D6D6D',
		            	shape_type_text_color: '#fff',
		            	shape_type_border_color: "#fff",
                    shape_icon: 'Arch_Amazon-Chime.png|data:img...',
                    is_round_corners: true|false,
                    sub_levels: 0,
                    export_attributes: [],
                    items: [
                    	...
                    ]
                },
                ...
            	]
	    	},
			{
            id: '12345',
            name: "Main Object 2",
			  shape_type_color: '#6D6D6D',
			  shape_type_text_color: '#fff',
			  shape_type_border_color: "#fff",
            shape_icon: 'Arch_Amazon-Chime.png|data:img...',
            is_round_corners: true|false,
            export_attributes: [],
            items: []
        	},
        	...
	  	]
	}
```

2. Response On Success For `box` type

```
	{
		status: true,
		groups: [ (if no data, return empty)
			{
				id: 12345, (object or attribute id),
				group_id: (temporary ID generated in backend),
				name: "Object or Attribute Name",
				background_color: '#6D6D6D',
  				shape_type_color: '#6D6D6D',
            	shape_type_text_color: '#fff',
            	shape_type_border_color: "#fff",
            	is_round_corners: true|false,
				object_ids: [1, 2,...],
				group_ids: [1,2,3...], (in case group contains other groups),
				group_id: "1234567",
				parent_group_id: "123456",
				export_attributes: [
              {
                "currency": "USD",
                "attribute_id": "60df33da1a61877cf877c96a",
                "name": "TestAttribute106",
                "type": "decimal",
                "selected_value": [
                  "60"
                ],
                "decimal_places": "3"
              },
              {
                "attribute_id": "60e5259365c8a0235c3fdb1e",
                "name": "TestAttributeType",
                "type": "date",
                "selected_value": [
                  "2022-01-10"
                ]
              },
              {
                "currency": "usd",
                "attribute_id": "60daef2605ee971f5c5d998d",
                "name": "IntegerAttributeType",
                "type": "integer",
                "selected_value": [
                  "14"
                ],
                "decimal_places": ""
              },
              {
                "currency": "gbp",
                "attribute_id": "60daef0a05ee971f5c5d998b",
                "name": "DecimalAttributeType",
                "type": "decimal",
                "selected_value": [
                  "51"
                ],
                "decimal_places": "3"
              },
              {
                "attribute_id": "60fa8855d4aa7e22e3766174",
                "name": "ZzzAttr",
                "type": "date",
                "selected_value": [
                  "2022-02-10"
                ]
              },
              {
                "attribute_id": "60daeef505ee971f5c5d998a",
                "name": "DateAttributeType",
                "type": "date",
                "selected_value": [
                  "2022-03-10"
                ]
              },
              {
                "attribute_id": "60daef3905ee971f5c5d998f",
                "name": "BooleanAttributeType",
                "type": "boolean",
                "selected_value": [
                  "true"
                ]
              },
              {
                "attribute_id": "6112a451cab6c2337fd3f481",
                "name": "Multi",
                "type": "multiple-list",
                "selected_value": [
                  "One",
                  "Two"
                ]
              },
              {
                "attribute_id": "60daeee605ee971f5c5d9989",
                "name": "TextAttributeType",
                "type": "text",
                "selected_value": [
                  "some value"
                ]
              },
              {
                "attribute_id": "60daef9905ee971f5c5d9995",
                "name": "MultiListAttributeType",
                "type": "multiple-list",
                "selected_value": [
                  "ItemMul1",
                  "ItemMul2"
                ]
              },
              {
                "attribute_id": "6244b6f32ab1643bb8576e96",
                "name": "Justin Is",
                "type": "multiple-list",
                "selected_value": [
                  "Awesome"
                ]
              },
              {
                "attribute_id": "60daef7105ee971f5c5d9991",
                "name": "ListAttributeType",
                "type": "list",
                "selected_value": [
                  "Item1"
                ]
              },
              {
                "attribute_id": "60dc921c025cfd71d051c7b8",
                "name": "Agile",
                "type": "text",
                "selected_value": [
                  "project management"
                ]
              },
              ...
            ]
			},
			...
		],
    	data : [
	    	{
    			id: '1',
            	name: "Main Object 1",
            	background_color: '#6D6D6D',
  				shape_type_color: '#6D6D6D',
            	shape_type_text_color: '#fff',
            	shape_type_border_color: "#fff",
         		shape_icon: 'Arch_Amazon-Chime.png|data:img...',
            	is_round_corners: true|false,
        		other_model_id: 12345|null,
            	relationships: [
            		{
            			id: "1234", relationship ID,
            			object_id: "1234", (to object_id),
            			group_id: "1234", (this refers to group_id, might be null too),
            			attribute_text: "text here"
            		},
            		...
            	]
	    	},
			{
            id: '2',
            name: "Main Object 2",
			  shape_type_color: '#6D6D6D',
			  shape_type_text_color: '#fff',
			  shape_type_border_color: "#fff",
   			  shape_icon: 'Arch_Amazon-Chime.png|data:img...',
            is_round_corners: true|false,
			  relationships: [
            		{
            			id: "1234", relationship ID,
            			object_id: "1234", (to object_id),
		    			group_id: "1234", (this refers to group_id, might be null too),
            			attribute_text: "text here"
            		},
            		...
            	]
        	},
        	...
	  	]
	}
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 101. Model Import Diagram: POST /model/import/diagram

Notes: 

1. The `types` can be empty as well. Also mark this manual imported diagrams as `is_manual_imported` in diagram collection. If `generate_diagram_contents ` is true, we should generate objects and set `is_manual_imported` flag `0`.

Important: the `diagrams` in response should be returned only when `generate_diagram_contents` is set to `1`

2. When `reuse_objects` is true we should not create new objects if we have that object in model, otherwise create objects regardless if we have that in model or no

Request

```
	{
		login_key: "logged in user token",
		model_folder_id: "1", (either model or folder id),
		generate_diagram_contents: true|false,
		reuse_objects: true|false,
		diagram_mapping: [
			{
				diagram_name: "Diagram 1",
				file_name: "file name to be saved at diagram collection",
				file_content: "xml content of diagram",
				diagram_type_id: 1,
				svg: "xml content or null",
				svg_padding_top: "number or null",
				svg_padding_left: "number or null"
			},
			...
		]
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		pages: 1234 (parent pages after adding new item),
		has_childs: true|false,
		diagrams: [
			{
				diagram_id: 1,
				xml: '<xml goes here>
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 102. Save View Generator POST /model/save/view

Notes: `ids` is an array of selection, can be either model, folder or one/multiple objects, this selection can be used to return parent_id. If multiple objects selected at different levels the parent_id should be their top level model id, otherwise if they are the same level then their parent. If model/folder selected then only this could be used for parent_id.

Request

```
	{
		id: 1234, (id of view generation, presents when we update View Generation, for creating new items this will be null),
		selected_ids: [1,2], (selection ids from left navigation),
		selected_type: model|folder|object,
		type: "box|hierarchy",
		filter_object_types: [1,2] (object type ids, can be empty too),
		filter_relationship_types: [1,2] (relationship type ids, can be empty too),
		filter_num_levels: 2 (level indicator),
		group_options: { (can be null if no group by used)
			id: 1,
			type: attribute|relationship
		},
		name: "Cool View",
		layout_type: "top_to_bottom|left_to_right|bottom_to_top|right_to_left",
		relationship_description: ""
	}
```

Response On Success

```
	{
		status: true,
		parent_id: 1234,
		model_id: 1234,
		parent_parent_id: 1234,
		pages: 1 (number of pages of parent after adding view),
		has_child: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
<br>

## 103. Delete Object: POST /delete/view


Request

```
	{
		login_key: "logged in user token",
		id: '1'
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	    pages: 1234,
	    has_childs: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 104. List Of Diagram Types For View Generator: POST /load/view/diagram/types

Get list of Diagram Types that have shapes for objects, relationships for objects we get using filters.

Request

```
	{
		login_key: "logged in user token",
		selected_ids: ["1234","12345"] (ids of left sidebar selection),
		selected_type: "model|folder|object",
		filter_object_types: [1,2] (object type ids, one or multiple or empty[]),
		filter_relationship_types: (relationship type ids, one or multiple or empty[]),
		filter_num_levels: "1234", (number),
		type: "box|hierarchy",
		group_options: { (can be null if no group by used)
			id: 12345,
			type: attribute|relationship
		},
		relationship_description: "",
		page: 1 (this could be used for the pagination),
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagram_types: [
			{
				id: 1,
				name: "Object Type 1",
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified model/folder or it's attributes last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 105. Get Object Shape Types: POST /load/view/object/shapes

Notes:

1. The `export_attributes` should contain object those attributes who have the `export_do_diagram` flag set `true` and they have value (are not `null`). The response for `selected_value` should be the 

Request

```
	{
		login_key: "logged in user token",
		diagram_type_id: "1234",
		selected_ids: ["1234","12345"] (ids of left sidebar selection),
		selected_type: "model|folder|object",
		filter_object_types: [1,2] (object type ids, one or multiple or empty[]),
		filter_relationship_types: (relationship type ids, one or multiple or empty[]),
		filter_num_levels: "1234", (number),
		type: "box|hierarchy",
		group_options: { (can be null if no group by used)
			id: 12345,
			type: attribute|relationship
		}

	}	
```

Response On Success

```
	{
		status: true <boolean>,
		object_shapes: [
			{
				id: 1,
				name: "Object 1",
				encoded_xml: "Shape encoded xml",
				relationships: [
					{
						id: "10",
						relationship_type_id: 1234,
						name: "Serving",
						encoded_xml: "Shape encoded xml"
						to_object_id: "1234",
						start_line: "line1",
						end_line: null,
					},
					...
				],
				export_attributes: [
		      			{
			            attribute_id: '1',
			            name: 'Some Text',
			            type: 'text',
			            selected_value: ['Sample of text attribute'],
			          },
			          {
			            attribute_id: '2',
			            name: 'Some Date',
			            type: 'date',
			            selected_value: ['2021-04-16'],
			          },
			          {
			            attribute_id: '21',
			            name: 'Some Date Range',
			            type: 'date_range',
			            selected_value: ['2021-04-16','2021-04-17'],
			          },
			          {
			            attribute_id: '3',
			            name: 'Some Decimal',
			            type: 'decimal',
			            selected_value: '4.0',
			            values: ['1.0', '1.5'],
			            currency: 'USD',
			          },
			          {
			            attribute_id: '4',
			            name: 'Some Integer',
			            type: 'integer',
			            selected_value: '5',
			            values: ['1', '2'],
			            currency: 'EUR',
			          },
			          {
			            attribute_id: '5',
			            name: 'Some Boolean',
			            type: 'boolean',
			            selected_value: 'true',
			          },
			          {
			            attribute_id: '6',
			            name: 'Some List',
			            type: 'list',
			            selected_value: ['Option 2'],
			          },
			          {
			            attribute_id: '7',
			            name: 'Some Multiple List',
			            type: 'multiple-list',
			            selected_value: ['Multiple 1', 'Multiple 2'],
			          },
			          {
			            attribute_id: '8',
			            name: 'Another Text 8',
			            type: 'text',
			            selected_value: ['Cool text']
			          },
			          {
			            attribute_id: '9',
			            name: 'Event Date',
			            type: 'date',
			            selected_value: ['2021-04-20']
			          },
		
					...
				]
			},
			...
		],
		groups: [
			{
				name: "Group 1",
				encoded_xml: "Shape encoded xml",
				object_ids: [1,2,3,4...]
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 106. Update Left Sidebar Width: POST /user/update/left/sidebar

Notes: For Model viewer page we have left sidebar where we show the tree view, each system user can resize this and have different width of sidebar. We need to save this data into users collection as `model_viewer_left_sidebar_width` which is going to be a number, by default for a new added users we can hardcode as `0`.


Request

```
	{
		login_key: "logged in user token",
		width: 100
	}	
```

Response On Success

```
	{
	    status: true,
	    error: '',
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 107. Save Exported View Diagram POST /diagram/save/exported

Notes:<br>
1. The `parent_id` in response should be generated from the `selected_ids` and `selected_type`, similar to `#102` API.<br>
2. The `pages` means how many pages parent got after saving a Diagram


Request

```
	{
		name: "Diagram 1",
		diagram_type_id: "1234",
		diagram_xml: "<xml content here>",
		svg: "<xml content here>",
		svg_padding_top: 10,
		svg_padding_left: 0,
		selected_ids: ["1234","12345"] (ids),
		selected_type: "model|folder|object|view"
	}
```

Response On Success

```
	{
	    status: true,
	    parent_id: "1234",
	    model_id: "1234",
	    pages: 10,
	    error: '',
	    has_childs: true|false
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 108. Model Viewer Update Current State POST /model/viewer/update/state

Notes:

1. Each `token` is unique, before we create a new record we should check if we have a record in database with this token, if so we update it. We can't have duplicates in database for the same token
2. The `token` is a string, the `currentActivePage` is a string and the rest are arrays that will contain list of ids, they can contain no values as well
3. The collection to store this values should be independent of user, so it can be created from one user and be accessed from another

Request

```
	params: {
		{
			token: "1234abc",
   	 		expandedFolderIds: [],
	    	expandedObjectIds: [],
	    	expandedModelsIds: [],
	    	currentActivePage: 'string',
	    	selectedModelIds: [],
	    	selectedObjectIds: [],
    		selectedDiagramIds: [],
	    	selectedFolderIds: [],
	    	selectedViewsIds: [],
		}
	}
```

Response On Success

```
	{
	    status: true
	}
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 109. Model Viewer Get Current State POST /model/viewer/get/state

Request

```
	{
	    token: "1234"
	}
```

Response On Success

```
	status: true,
	params: {
		token: "1234abc",
		expandedFolderIds: [],
		expandedObjectIds: [],
		expandedModelsIds: [],
		currentActivePage: 'string',
		selectedModelIds: [],
		selectedObjectIds: [],
		selectedDiagramIds: [],
		selectedFolderIds: [],
		selectedViewsIds: [],
	}
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 110. Delete bulk objects & relationships POST /model/viewer/delete/object/relationships

Notes: 

1. Both `object_ids` and `relationship_ids` are optional, this means we may have both to have values or one of them. 
2. When the `object` got removed, need to collect those items to send with response inside `items`.
	* `id` is object's id
	* `parent_id` is object's parent_id (this can be model too in case it created under model).
	*  `parent_parent_id` is parent_id of parent of deleting object (in case we don't have this it can be model_id).
	*  `model_id` is just model_id from top of hierarchy of this object 
	*  when object removed all related relationships to this object should be removed as well
3. Removing relationships doesn't have to affect the `items` in response, only object deletion should


Other notes: please note that before we delete items at some point there might be a scenario when they don't exist in database, in that case no need to send error response, just return true but `items` to be empty array `[]`. The `items` should always present even if has no value.

Request

```
	{
	    object_ids: [1,2,3],
	    relationship_ids: [1],
	    delete_permanent: true|false
	}
```

Response On Success

```
	status: true,
	items: [
		{
			id: 1234,
			parent_id: 1234,
			parent_parent_id: 1234,
			model_id: 1234
		},
	]
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 111. Restore deleted objects POST /model/viewer/restore/objects

Request

```
	{
	    object_ids: [1,2,3]
	}
```

Response On Success

```
	status: true,
	items: [
		{
			id: 1234,
			name: "Object 1",
			parent_id: 1234,
			parent_parent_id: 1234,
			model_id: 1234
		},
	]
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>

## 111.1 Restore deleted relationships POST /model/viewer/restore/relationships

Request

```
	{
	    relationships: [
	    	{
	    		id: 1,
	    		type: 'object_relationship|diagram_relationship'
	    	},
	    	...
	    ]
	}
```

Response On Success

```
	status: true,
```


Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```
<hr>


## 112 List Of Publications: POST /publications

Notes: if `show_svg` is `true` it should return `diagram_svg` value, otherwise it may contain no data for that field. 

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		show_svg: true|false,
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		publications: [
			{
				id: 1,
				name: "Publication 1",
				diagram_id: 1,
				diagram_svg: "<svg...",
				diagram_type_id: 1,
				diagram_name: "Home diagram name",
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified the record",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 113. Search Diagrams POST /diagram/search

Notes: show first 50 matches

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string",
		checked_items: [
			{
				id: 1,
				type: "model"
			},
			{
				id: 2,
				type: "folder"
			},
			...
		]
	},
	
```

Response On Success

```
	{
		status: true,
		diagrams: [
			{
				diagram_id: 1,
				name : 'Diagram 1',
				model_name: "Model 1",
			},
			{
				diagram_id: 2,
				name : 'Diagram 2',
				model_name: "Model 2",
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 114. Add Publication: POST /create/publication

Notes: the `checked_model_items` and `group_ids` could be just blank array.

Request

```
	{
		name: "Publication 1",
		diagram_id: 1,
		checked_model_items: [
			{
				id: 1,
				type: "model|folder|object|diagram"
			},
			....
		],
		group_ids: [1,2,3...]
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 115. Delete Publication: POST /delete/publication

Request

```
	{
		publication_ids: [1, 2] (one or multiple publication ids),
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 116. Update Publication: POST /update/publication

Request

```
	{
		id: 1,
		login_key: "logged in user token",
		name: "Object type 1",
		diagram_id: 1,
		checked_model_items: [
			{
				id: 1,
				type: "model|folder|object|diagram"
			},
			....
		],
		group_ids: [1,2,3...],
		update_only_name: true|false (if is true we only updating name, otherwise both name and attributes)
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 117. Publication Details: POST /publication/detail

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		publication: {
			id: 1,
			name: "Publication 1",
			diagram_id: 1,
			diagram_name: "Some Diagram",
			diagram_svg: "<svg..."
			available_user_groups: [
				{
					id: 1,
					name: "Group 1"
				},
				...
			],
			selected_user_groups: [
				{
					id: 2,
					name: "Group 2",
				},
				...
			],
			checked_model_items: [
				{
					id: 1,
					type: "model"
				},
				{
					id: 2,
					type: "folder"
				},
				...
			]
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 118. Publication Linked Objects: POST /publication/linked/objects

Request

```
	{
		diagram_id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		objects: [
            {
              object_id: '1',
              diagram_id: '1',
              diagram_name: 'Diagram 1',
              has_more_diagrams: false
            },
            {
              object_id: '2',
              diagram_id: null,
              diagram_name: null,
              has_more_diagrams: true,
            },
          ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 119. Object Linked Diagrams: POST /object/linked/diagrams

Request

```
	{
		object_id: 1,
		page: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagrams: [
        {
          diagram_id: '1',
          name: 'Diagram 1',
        },
        {
          diagram_id: '2',
          name: 'Diagram 2',
        },
        ...
      ],
      pages: 10
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 119.1 Diagram Details: POST /diagram/details

Need to make sure if user has access to the publication of this Diagram before checking it.

Request

```
	{
		diagram_id: 1,
	}	
```

Response On Success

```
	{
		status: true <boolean>,
      	diagram: {
 			diagram_id,
        	name: 'Diagram 1',
        	svg: '<svg...',
    	}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 120. Diagram Color setting: POST /diagram/color

Request

```
	{
		diagram_id: 1,
		attribute_id: 1,
		selected_value: ["true"],
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		match_objects	: [
  			[
  				'1234',
  				'12345',
  				'123456',
  			],
  			[
  				'12345678',
  			],
  			...
  		],
      	other_objects: [
      		'1',
      		'12',
      		'123'
      ],
      match_values: [
		{
			selected_value: ["abc"],
			type: "text", (need to support all types)
		},
      	...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 121. Diagram Heatmap setting: POST /diagram/heatmap

Request

```
	{
		diagram_id: 1,
		attribute_id: 1,
		selected_value: ["true"],
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		objects	: [
  			[
  				'1234',
  				'12345',
  				'123456',
  			],
  			[
  				'12345678',
  			],
  			[
  				'12345678',
  			],
  			[
  				'12345678',
  			],
  			[
  				'12345678',
  			],
  		],
		match_values: [
			{
				selected_value: ["abc"],
				type: "text", (need to support all types)
			},
	      	...
      ]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 122. Handle Model Favorite State: POST /model/set/favorite

Request

```
	{
		model_id: 1,
		state: true|false,
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 123. User Favorite Models: POST /favorite/models

If `show_all` is set to `true`, remove all user favorite models, otherwise max 50 items. When `show_all` is set to `false` and we have more than 50 items for the user, return `has_more_models` as `true`. 
 
Request

```
	{
		show_all: true|false
	}	
```

Response On Success

```
	{
		status: true,
		models: [
			{
				id: "1",
				name: "Model 1"
			},
			...
		],
		has_more_models: true|false
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 124. Permissions: POST /group/permissions

 
Request

```
	{
		type: "model|object",
		id: "1234",
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		pages: 2,
		permissions: [
			{
				id: 1,
            	name: "Group 1",
            	can_read: true,
            	can_edit: false,
            	can_add_relationship: true,
            	can_delete: false
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 125. Update Group Permission: POST /group/permissions/updates

 
Request

```
	{
		filter_id: "1234",
		filter_type: "model|object",
		group_id: 1234,
		permission: "read|edit|add_relationship|delete",
		value: true|false
	}
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 126. Model Organize: POST /model/organize

 
Request

```
	{
		model_id: "1234"
	}
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 127. Diagram Check Deleted Object Relationships: POST /diagram/deleted/object/relationships

Notes: the XML is a new version of Diagram, need to check with old xml for given diagram ID and see what objects and relationships got removed from Diagram.
 
Request

```
	{
		diagram_id: "1234",
		xml: '<xml...'
	}
```

Response On Success

```
	{
		status: true,
		objects: [
			{
				id: "1",
				name: "Object 1",
				model_name: "Best Model",
				object_type_name: "Best Type",
			},
			...
		],
		relationships: [
			{
				id: "1",
				relationship_type_name: "Composed of",
				from_object_name: "Object 1",
				to_object_name: "Object 2"
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 128. Popular Diagrams: POST /popular/diagrams

Return last 5 diagrams

Response On Success

```
	{
		status: true,
		diagrams: [
			{
				diagram_id: '1',
     	 		model_id: '2',
          	name: 'Diagram 1',
			},
			...
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 129. Popular Models: POST /popular/models

Return last 5 popular models

Response On Success

```
	{
		status: true,
		models: [
			{
				id: '1',
          	name: 'Model 1',
			},
			...
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 129.1 Popular Queries: POST /popular/queries

Return last 5 popular queries

Response On Success

```
	{
		status: true,
		queries: [
			{
				id: '1',
          	name: 'Query 1',
			},
			...
		],
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 130. Add Data Connector: POST /add/data-connector

Request

```
	{
		login_key: "logged in user token",
		form_data : {
			name: "Best Connector",
			client_id: "1234",
			client_secret: "12345",
			object_permission: "read|write|admin",
			relationship_permission: "read|write|admin",
			attribute_permission: "read|write|admin",
			model_permission: "read|write|admin",
		},
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 131. Update Data Connector: POST /update/data-connector

Notes: in case update_only_name is true we should update only name of it and skip other attributes.

Request

```
	{
		login_key: "logged in user token",
		id: 1, (connector ID),
		update_only_name: true|false,
		form_data : {
			name: "Best Connector",
			client_id: "1234",
			client_secret: "12345",
			object_permission: "read|write|admin",
			relationship_permission: "read|write|admin",
			attribute_permission: "read|write|admin",
			model_permission: "read|write|admin",
		},
	}	
```

Response On Success

```
	{
		status: true
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 132. Data Connector Details: POST /data-connector/details

Request

```
	{
		login_key: "logged in user token",
		id: 1, (connector ID),
	}	
```

Response On Success

```
	{
		status: true,
		connector: {
			name: "Best Connector",
			client_id: "1234",
			client_secret: "12345",
			object_permission: "read|write|admin",
			relationship_permission: "read|write|admin",
			attribute_permission: "read|write|admin",
			model_permission: "read|write|admin",
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 133. List Of Data Connectors: POST /data/connectors

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		data_connectors: [
			{
				id: 1,
				name: "Best Connector",
				created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 134. Delete Data Connectors: POST /delete/data-connectors


Request

```
	{
		connector_ids: [1, 2] (one or multiple connector ids),
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 135. API Fetch Excel: POST /data-connector/fetch/excel

Notes
1. This request is not using JWT and sends form with login_key inside the main request
2. We have to read the excel file and send sheets in response, only send max 10 rows (even if excel contains thousand of rows we max send 10 rows or less if we have less rows)
3. In response all rows should be a new row in `items` response, and columns/values should be the same way. No need to cut the header in xlsx, we just read first 10 rows and send them
4. The imported XLSX should be saved in server (excel id should be returned). It should have 2 statuses `pending` and `imported`. If status is `pending` and not changed in 24 hours, we delete the file.
5. Note that we are going to save the logs of saved/imported excel data (save is when we save import rules, import is when rules saved along with importing data). When saved/imported that's when excel_id should be moved from temporary collection to saved imports collection with `is_imported` flag `true|false`
6. The `excel_id` would be used in next API where we do save or import excel (that's when this id would be used to move it to logs from temporary collection where we delete them after 24 hours, in new collection of logs we don't delete any files until manually are not deleted)

Request

```
	{
		excel: {FILE_OBJECT},
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		sheets: [
			{
				name: 'Application Components',
          	excel_id: '1',
          	items: [
          		[
          			'Col1',
          			'Col2',
          			'Col3',
          			...
          		],
          		...
          	]
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>

## 135.1 API Fetch Excel: POST /data-connector/import/excel

Notes

1. The `type` can be either `save` or `import`. If it's `save` we just save the JSON in database and do not do import. If it's `import` we save and do validation, then only we import
2. The `sheets`/`items` contains max 10 rows and when importing need to lookup values from the original XLSX, this data is just for front end demonstration
3. Each sheet contains `excel_id` which is pulled from #135 API and will tell us what excel file to use and `name` for each sheet is the sheet we should import
4. Each sheet has `options`, if it has `has_headers` set to `true` then we just ignore first row of the excel sheet (no other logic needed for this)
5. `source_model_id` tells under which model we should apply this changes (like create objects etc). Ignore the `model_name`, it's used in front end. And `target_model_id` is for relationship.
6. Ignore the `object_attributes` and `relationship_attributes` when importing, that's for front end displaying
7. When importing, each sheet has this options

* TYPE = `object`. In this case the `column_values` will contain one of following `{id: object_name, group: "Global"}`, `{id: object_type, group: "Global"}`. It also my contain `{id: 1234, "group": "Attributes"`}` which means here we have an attribute ID. The `group` tells us if it's attribute or not. Here we should create objects and apply attributes (if we have attributes set in xlsx), note that the object might not support that attribute, in this case we don't add the attribute to it.


* TYPE = `relationship`. In this case the `column_values` will contain one of following `{id: from, group: "Global"}`, `{id: to, group: "Global"}, {id: type, group: "Global"}`. It also my contain `{id: 1234, "group": "Attributes"`}` which means here we have an attribute ID. The `group` tells us if it's attribute or not (note that here is Relationship attribute not object). Here we should create relationships between objects and apply attributes (if we have attributes set in xlsx), note that the relationship type might not support that attribute, in this case we don't add the attribute to it.

8. If global `type` in request is `import` we should check if we have the model, the object type etc, the same for relationships all scenarios. If we don't have the right data we should trigger an error, like "Model ABC not found, please select another one". Or, "Relationship type ABC not found, please select another one". When we do `save` just save it, no validation needed. For security reasons we can check the structure of the request to not save in database any addional thing we don't have listed below (not that we may have some items empty).

9. See different responses for `save` and `import` types
10. Once the save or import done, we store the record in database we later can use.

Request

```
	{
		login_key: "logged in user token",
		excel_import_id: "1" (can be empty too if we creating a new one),
		import_name: "Best import",
		type: "save|import",
		sheets: [
			{
				excel_id: 1,
				name: 'Shee1',
				items: [
					[
						'col1',
						'col2',
						'col3',
						...
					],
					...
				],
				options: {
					has_headers: false,
					max_columns: 5,
					source_model_id: 1,
					source_model_name: "Best Model",
					target_model_id: 2,
					target_model_name: "Best Model",
					type: "object|relationship",
					reuse_objects: true|false,
					column_values: [
						{
							id: 1,
							name: "Object Name|Other names...",
							group: "Global|Attributes"
						},
						...
					],
				}
			}
		]
	}	
```

Response On Success (`type` = `save`)

```
	{
		status: true,
		excel_import_id: 1
	}	
```

Response On Success (`type` = `import`)

Notes: in case we have different models for each sheet, remove duplicates in response by id.

```
	{
		status: true,
		excel_import_id: 1
		objects_created: 10,
		models: [
			{
				"model_id": "1",
				"name": "Model1",
				"total": 2
			},
			...
		],
		relationships_created: 0,
		attributes_created: 10,
		failed_creations: 20 (items we were not able to add)
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>

## 135.2 API Get Excel Import Record: POST /excel-import/get/record

Note: the ID is excel imported record id but not excel file id as one import may contain multiple excel files

Request

```
	{
		login_key: "logged in user token",
		id: "1"
	}	
```

Response On Success

```
	{
		status: true,
		"name": "Best Import",
      "sheets": [
        {
          "name": "Application Components 1",
          "excel_id": "1",
          "items": [
            [
              "Object Name",
              "Object Type",
              "Model",
              "Cost"
            ],
            [
              "App1",
              "Application Component",
              "Model1",
              "10000"
            ],
            [
              "App2",
              "Application Component",
              "Model1",
              "5000"
            ],
            [
              "App3",
              "Application Component",
              "Model2",
              "15000"
            ],
            [
              "App4",
              "Application Component2",
              "Model3",
              "16000",
              "17000"
            ],
            ...
          ],
          "options": {
            "source_model_id": 1,
            "source_model_name": "",
            "target_model_id": 1,
            "target_model_name": "",
            "type": "object",
            "has_headers": true,
            "reuse_objects": true,
            "max_columns": 5,
            "column_values": [
              {
                "id": "object_name",
                "name": "Object Name",
                "group": "Global"
              },
              {
                "id": "object_type",
                "name": "Object Type",
                "group": "Global"
              },
              {
                "id": 1,
                "name": "Attribute 1",
                "group": "Attributes"
              },
              ...
            ],
          }
        },
        ...
    	]
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>



## 136. Change Logs List: POST /model/change-logs


Request

```
	{
		login_key: "logged in user token",
		id: 1, 
		type: "model|folder|object",
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		pages: 2,
		change_logs: [
			{
			  id: 1,
            description: "Renamed object 1",
            created_on: "2023-03-28 13:01:00",
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>

## 137. Change Log Rollback API: POST /model/change-logs/rollback


Request

```
	{
		login_key: "logged in user token",
		id: 1, 
	}	
```

Response On Success

```
	{
		status: true,
		name: "New name here"
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>

## 138. Relationship Diagram Search API: POST /relationship/diagram/search

Request

```
	{
		login_key: "logged in user token",
		keyword: 1, 
		page: 1
	}	
```

Response On Success

```
	{
		status: true,
		diagrams: [
			{
				diagram_id: 1,
				name: "Best Diagram",
				model_name: "Model 1"
			},
			...
		]
	}	
```

Response On Failure

```
	{
		status: false
	}	
```

<hr>

## 139. Add Object Diagram Relationship POST /object/diagram/relationship

Request

```
	{
		login_key: "logged in user token",
		from_object_ids: [1,2,3...],
		diagram_id: "3",
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 140. Relationship Update Attributes POST /relationship/update/attributes

Request

```
	{
		login_key: "logged in user token",
		relationship_id: 1,
		attribute_data_items: [
			{
				attribute_id: 1,
				value: "attribute value"
			},
			...
		],
	},
	
```

Response On Success

```
	{
		status: true
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

## 141. Inline Editor Relationship Diagrams POST /object/inline/diagrams (DEPRECATED)

When `diagram_id` is set, we should fetch the Diagram XML and look for ObjectID cells, then check which objects exists in this list with their child objects and the rest logic should be done as we sent `object_ids`.

Important: the objects can contain other objects, in that case regardless we selecting a folder, model or object, in case any object has other object then we should return them too.

Request

```
	{
		login_key: "logged in user token",
		object_ids: [1,2], (see notes)
		folder_id: 1, (see notes)
		model_id: 1, (see notes),
		diagram_id: 1,
		view_id: 1,
		page: 1
	},
	
	only 1 of these 3 can have value object_ids, folder_id, model_id.
	
```

Response On Success

```
	{
		status: true,
		pages: 2,
		diagrams: [
			{
				object_id: 1,
				object_name: "Object",
				id: 1, (relationship id)
				diagram_id: 1,
				diagram_name: "Diagram",
				diagram_model_name: 'Model',
				created_by: "user1",
				updated_by: "user2",
				created_on: "2022-01-01 00:00:00",
				updated_on: "2022-01-01 00:00:00"
        	},
		]
	}
```	

## 142. Change Object Diagram Relationship POST /object/inline/diagrams


Request

```
	{
		login_key: "logged in user token",
		object_id: 1,
		relationship_id: 1,
		diagram_id: 1
	},
	
```

Response On Success

```
	{
		status: true,
	}
```	

## 143. Delete Diagram Relationships POST /delete/diagram/relationships


Request

```
	{
		relationship_ids: [
			'123',
			'1234',
			...
		]
	}
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 144 Search Models POST /model/search


Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		models: [
			{
				id: 1,
				name : 'Model 1',
			},
			{
				id: 2,
				name : 'Model 2',
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 145 Search Object Attributes POST /object/attributes/search

Notes: The API should return all attributes that been assigned to object types. And for all items in response hardcode "Attributes" in group field. Only return items that user has access to. Order by attribute name ascending.

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		attributes: [
			{
				id: 1,
				name : 'Model 1',
				group: "Attributes"
			},
			{
				id: 2,
				name : 'Model 2',
				group: "Attributes"
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 146 Search Relationship Attributes POST /relationship/attributes/search

Notes: The API should return all attributes that been assigned to relationship types. And for all items in response hardcode "Attributes" in group field. Only return items that user has access to. Order by attribute name ascending.

Request

```
	{
		login_key: "logged in user token",
		keyword: "text or empty string"
		page: 1
	},
	
```

Response On Success

```
	{
		status: true,
		pages: 100,
		attributes: [
			{
				id: 1,
				name : 'Model 1',
				group: "Attributes"
			},
			{
				id: 2,
				name : 'Model 2',
				group: "Attributes"
			},
			...
		]
	}
```	

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 147. List Of Excel Imports: POST /excel-imports

Notes: here we display items that been added through #135.1 API

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|has_imported_asc|has_imported_desc|imported_date_asc|imported_date_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		excel_imports: [
			{
				id: 1,
				name: "Best Connector",
				has_imported: "true|false",
				imported_date: "Y-m-d H:i:s" (date or empty/null),
				created_date: "Y-m-d H:i:s" (date or empty/null),
			created_by: "user name who created the record",
			updated_by: "user name who modified model/folder or it's attributes last time",
			updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 148. Delete Excel Imports: POST /delete/excel-imports


Request

```
	{
		excel_import_ids: [1, 2] (one or multiple excel import ids),
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 149. Rename Excel Import: POST /excel-import/rename


Request

```
	{
		id: 1,
		name: "New Import",
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 150. List Of Queries: POST /queries

Request

```
	{
		login_key: "logged in user token",
		sort: "name_asc|name_desc|created_date_asc|created_date_desc|updated_by_asc|updated_by_desc|updated_date_asc|updated_date_desc",
		page: 1 (this could be used for the pagination)
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		queries: [
			{
				id: 1,
				name: "Query 1",
				created_date: "Y-m-d H:i:s" (date or empty/null),
				created_by: "user name who created the record",
				updated_by: "user name who modified model/folder or it's attributes last time",
				updated_date: "Y-m-d H:i:s" (date or empty/null),
			},
			...
		],
		pages: 20 total pages found
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 151. Queries: POST /delete/queries


Request

```
	{
		query_ids: [1, 2] (one or multiple query ids),
		login_key: "logged in user token",
	}	
```

Response On Success

```
	{
		status: true,
		pages: 1, (pages remaining after deleted items)
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 152. Add Query: POST /add/query

Request

```
	{
		login_key: "logged in user token"
		name: "Query 1",
		query: "Description"
	}	
```

Response On Success

```
	{
		status: true,
		page: 4
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 153. Edit Query: POST /update/query

Request

```
	{
		id: 1,
		login_key: "logged in user token",
		name: "Query 1",
		query: "query here",
		update_only_name: true|false (if is true we only updating name, otherwise both name and attributes)
	}	
```

Response On Success

```
	{
		status: true,
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 154. Query Details: POST /query/detail

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		query_data: {
			id: 1,
			name: "Query 1",
			query: "query here"
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>

## 154.1 Query run: POST /query/run

Notes: 

1. First pair of array result should be a header of result and then data comes.
2. Return the headers only when page = 1
3. Regardless if we have data or not, if the query is valid it should return the headers (first row of data)

Request

```
	{
		query: "select * from table",
		page: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		pages: 1,
		items: [
			[
				"ID",
				"Name",
				...
			],
			[
				"1",
				"Some name",
				...
			],
			...
		]
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>


## 155. Digram Info: POST /diagram/info

Request

```
	{
		id: 1,
		login_key: "logged in user token"
	}	
```

Response On Success

```
	{
		status: true <boolean>,
		diagram: {
			id: 1,
			name: "Diagram 1",
			model_id: 1
		}
	}	
```

Response On Failure

```
	{
		status: false,
		error: "error string from the server"
	}	
```

<hr>
