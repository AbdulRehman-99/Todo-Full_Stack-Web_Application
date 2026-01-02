#!/usr/bin/env python3
"""
Main entry point for the CLI Todo Application.

This application provides a menu-driven interface for managing todo items
in memory only. All data is lost when the application closes.
"""

from cli.interface import TodoInterface


def main():
    """Main application entry point."""
    print("Welcome to the CLI Todo Application!")
    print("Type 'help' for available commands or use the menu system.")

    interface = TodoInterface()
    interface.run()


if __name__ == "__main__":
    main()