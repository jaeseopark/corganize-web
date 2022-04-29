from setuptools import setup, find_packages

setup(
    name="daemon",
    packages=find_packages(exclude=("test",)),
    python_requires=">=3.6",
    install_requires=["PyYAML", "commmons", "corganizeclient", "watchdog"]
)
