"""
Database connection module.
Handles MySQL database connections and operations.
"""
import mysql.connector
from mysql.connector import Error, pooling
from typing import Optional
from config import Config


class Database:
    """Database connection manager for MySQL."""
    
    _instance: Optional['Database'] = None
    _connection_pool: Optional[pooling.MySQLConnectionPool] = None
    _config = Config()
    
    def __new__(cls):
        """Singleton pattern to ensure only one database instance."""
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize database connection manager."""
        # Connection pool will be created lazily on first use
        pass
    
    def _create_connection_pool(self) -> None:
        """
        Create a connection pool for MySQL database.
        
        Raises:
            Error: If connection pool creation fails
        """
        try:
            # First, try to connect without database to check server connection
            try:
                test_conn = mysql.connector.connect(
                    host=self._config.DB_HOST,
                    port=self._config.DB_PORT,
                    user=self._config.DB_USER,
                    password=self._config.DB_PASSWORD
                )
                if test_conn.is_connected():
                    print(f"Successfully connected to MySQL server at {self._config.DB_HOST}")
                    test_conn.close()
            except Error as e:
                print(f"Warning: Could not connect to MySQL server: {e}")
                print("Please check your database configuration in .env file")
            
            # Now create pool with database
            pool_config = {
                'pool_name': 'customer_app_pool',
                'pool_size': 5,
                'pool_reset_session': True,
                'host': self._config.DB_HOST,
                'port': self._config.DB_PORT,
                'user': self._config.DB_USER,
                'password': self._config.DB_PASSWORD,
                'database': self._config.DB_NAME,
                'charset': 'utf8mb4',
                'collation': 'utf8mb4_unicode_ci',
                'autocommit': False,
            }
            
            self._connection_pool = pooling.MySQLConnectionPool(**pool_config)
            print("Database connection pool created successfully")
            
        except Error as e:
            if "Unknown database" in str(e):
                print(f"Error: Database '{self._config.DB_NAME}' does not exist.")
                print(f"Please create it using: CREATE DATABASE {self._config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
            else:
                print(f"Error creating connection pool: {e}")
            raise
    
    def get_connection(self) -> Optional[mysql.connector.MySQLConnection]:
        """
        Get a connection from the connection pool.
        
        Returns:
            Optional[mysql.connector.MySQLConnection]: Database connection object
        """
        try:
            if self._connection_pool is None:
                self._create_connection_pool()
            
            connection = self._connection_pool.get_connection()
            return connection
            
        except Error as e:
            print(f"Error getting connection from pool: {e}")
            raise
        except Exception as e:
            print(f"Unexpected error getting connection: {e}")
            raise
    
    def test_connection(self) -> bool:
        """
        Test database connection.
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        connection = None
        try:
            connection = self.get_connection()
            if connection and connection.is_connected():
                db_info = connection.get_server_info()
                print(f"Connected to MySQL Server version {db_info}")
                return True
            return False
            
        except Error as e:
            print(f"Error testing connection: {e}")
            return False
            
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    def execute_query(
        self, 
        query: str, 
        params: Optional[tuple] = None,
        fetch: bool = True
    ) -> Optional[list]:
        """
        Execute a database query.
        
        Args:
            query (str): SQL query to execute
            params (Optional[tuple]): Query parameters for parameterized queries
            fetch (bool): Whether to fetch results (for SELECT queries)
        
        Returns:
            Optional[list]: Query results if fetch=True, None otherwise
        """
        connection = None
        cursor = None
        try:
            connection = self.get_connection()
            if connection is None:
                raise Error("Failed to get database connection")
            
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params or ())
            
            if fetch:
                result = cursor.fetchall()
                connection.commit()
                return result
            else:
                connection.commit()
                return None
                
        except Error as e:
            if connection:
                connection.rollback()
            print(f"Error executing query: {e}")
            raise
            
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()


# Global database instance
db = Database()
