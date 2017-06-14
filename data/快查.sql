SELECT
	house_id,user_id,telephone
FROM
	(
		SELECT
		id house_id,	user_id
		FROM
			house_1
		WHERE
			-- id = 3225 and 
		soft_deleted = 0
		ORDER BY id desc
		LIMIT 5
	) a
LEFT JOIN user b ON a.user_id = b.id